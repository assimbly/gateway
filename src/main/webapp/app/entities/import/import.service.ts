import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { serverApiUrl } from 'app/config';
import { HANDLES_OWN_ERRORS } from 'app/core/interceptor/error-handler.interceptor';
import { AlertService } from 'app/core/util/alert.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { escapeHtml } from './import-files';
import { IFlowImportResult, ImportConflict, editorOf } from './import.model';

/** Calls whose failures the import page explains itself, next to the file the user chose. */
const OWN_ERRORS = new HttpContext().set(HANDLES_OWN_ERRORS, true);

/** Warnings say what wasn't brought across, so they stay longer than the default alert. */
const WARNING_TIMEOUT = 20000;

/** Imports a Flow from DIL, Camel XML or a script, and opens the Flow it became in its editor. */
@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  private readonly eventManager = inject(EventManager);
  private readonly resourceUrl = `${serverApiUrl}api/import`;

  importFlow(dil: string, onConflict: ImportConflict): Observable<IFlowImportResult> {
    return this.http.post<IFlowImportResult>(`${this.resourceUrl}/flow`, dil, {
      headers: { 'Content-Type': 'application/xml' },
      params: new HttpParams().set('onConflict', onConflict),
      context: OWN_ERRORS,
    });
  }

  importCamel(xml: string, name?: string): Observable<IFlowImportResult> {
    return this.http.post<IFlowImportResult>(`${this.resourceUrl}/camel`, xml, {
      headers: { 'Content-Type': 'application/xml' },
      params: nameParams(name),
      context: OWN_ERRORS,
    });
  }

  importScript(script: string, language: string, name?: string): Observable<IFlowImportResult> {
    return this.http.post<IFlowImportResult>(`${this.resourceUrl}/script`, script, {
      headers: { 'Content-Type': 'text/plain' },
      params: nameParams(name).set('language', language),
      context: OWN_ERRORS,
    });
  }

  /** Tells the user what was imported, with the warnings, refreshes the Flow list and opens the Flow in its editor. */
  open(result: IFlowImportResult): Promise<boolean> {
    // alerts are shown as HTML
    this.alertService.addAlert({ type: 'success', message: `${result.replaced ? 'Replaced' : 'Imported'} Flow ${escapeHtml(result.name)}` });
    result.warnings.forEach(warning =>
      this.alertService.addAlert({ type: 'warning', message: escapeHtml(warning), timeout: WARNING_TIMEOUT }),
    );
    this.eventManager.broadcast(new EventWithContent('flowListModification', 'imported'));
    return this.router.navigate(['/flow/editor', result.flowId], {
      queryParams: { mode: 'edit', editor: editorOf(result.type), id: result.flowId },
    });
  }
}

function nameParams(name: string | undefined): HttpParams {
  const trimmed = name?.trim();
  return trimmed ? new HttpParams().set('name', trimmed) : new HttpParams();
}
