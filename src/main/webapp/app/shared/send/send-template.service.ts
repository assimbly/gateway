import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { HeaderService } from 'app/entities/header/header.service';
import { MessageService } from 'app/entities/message/message.service';
import { IHeader } from 'app/shared/model/header.model';
import { IMessage } from 'app/shared/model/message.model';

import { HEADER_LANGUAGES, HEADER_TYPES, SendHeader, filledHeaders, templateHeadersToRows } from './send-headers';

/**
 * Message templates for the Send pages: a named, reusable set of headers (a Message with its Headers).
 * A template is copied into the headers editor when it is loaded. Editing the rows never changes the template,
 * only `create` and `update` do.
 */
@Injectable({ providedIn: 'root' })
export class SendTemplateService {
  private readonly messageService = inject(MessageService);
  private readonly headerService = inject(HeaderService);
  private readonly eventManager = inject(EventManager);

  list(): Observable<IMessage[]> {
    return this.messageService.getAllMessages().pipe(map(res => res.body ?? []));
  }

  /** The headers of a template, as editor rows. */
  load(messageId: number): Observable<SendHeader[]> {
    return this.headerService.query().pipe(map(res => templateHeadersToRows((res.body ?? []).filter(header => header.messageId === messageId))));
  }

  /** Stores the rows as a new template. Returns its id and the stored rows. */
  create(name: string, rows: SendHeader[]): Observable<{ id: number; rows: SendHeader[] }> {
    return this.messageService.create({ name }).pipe(
      switchMap(res => {
        const id = res.body!.id!;
        return this.saveHeaders(id, [], rows).pipe(map(saved => ({ id, rows: saved })));
      }),
      tap(() => this.announce()),
    );
  }

  /** Makes the stored headers of the template equal to the rows. Returns the stored rows. */
  update(messageId: number, previous: SendHeader[], rows: SendHeader[]): Observable<SendHeader[]> {
    return this.saveHeaders(messageId, previous, rows).pipe(tap(() => this.announce()));
  }

  private saveHeaders(messageId: number, previous: SendHeader[], rows: SendHeader[]): Observable<SendHeader[]> {
    const wanted = filledHeaders(rows);
    const keptIds = new Set(wanted.filter(row => row.id !== undefined).map(row => row.id));

    const removals = previous.filter(row => row.id !== undefined && !keptIds.has(row.id)).map(row => this.headerService.delete(row.id!));

    const saves = wanted.map(row => {
      const header: IHeader = {
        id: row.id,
        key: row.key.trim(),
        value: row.value ?? '',
        type: row.type || HEADER_TYPES[0],
        language: row.language || HEADER_LANGUAGES[0],
        messageId,
      };
      return (header.id === undefined ? this.headerService.create(header) : this.headerService.update(header)).pipe(
        map(res => templateHeadersToRows([res.body ?? header])[0]),
      );
    });

    const removed$: Observable<unknown> = removals.length > 0 ? forkJoin(removals) : of(null);
    const saved$: Observable<SendHeader[]> = saves.length > 0 ? forkJoin(saves) : of([]);
    return removed$.pipe(switchMap(() => saved$));
  }

  private announce(): void {
    this.eventManager.broadcast(new EventWithContent('messageListModification', 'OK'));
  }
}
