import { Component, OnInit, computed, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';

import { AlertService } from 'app/core/util/alert.service';
import { IMessage } from 'app/shared/model/message.model';

import { HEADER_LANGUAGES, HEADER_TYPES, SendHeader, emptyHeader, filledHeaders, sameHeaders } from './send-headers';
import { SendTemplateService } from './send-template.service';

/**
 * The headers of a message on the Send pages: key/value rows, with suggestions for the key.
 *
 * With `templatesEnabled` (Flows > Send) a Message template can be loaded into the rows, and the rows can be saved
 * as a new template or as an update of the loaded one. Loading copies the template, so editing the rows never changes
 * a template that other flows use.
 */
@Component({
  selector: 'jhi-send-headers-editor',
  imports: [FormsModule, NgSelectModule, FontAwesomeModule, RouterLink],
  templateUrl: './send-headers-editor.html',
})
export default class SendHeadersEditor implements OnInit {
  readonly headers = model<SendHeader[]>([]);
  /** Known header names that are offered next to free text. */
  readonly suggestions = input<string[]>([]);
  readonly templatesEnabled = input(false);

  private readonly templateService = inject(SendTemplateService);
  private readonly alertService = inject(AlertService);

  readonly types = HEADER_TYPES;
  readonly languages = HEADER_LANGUAGES;

  readonly templates = signal<IMessage[]>([]);
  readonly templateId = signal<number | null>(null);
  /** The rows as they were when the selected template was loaded or last saved. */
  readonly baseline = signal<SendHeader[]>([]);
  readonly showTypeLanguage = signal(false);
  readonly namingTemplate = signal(false);
  readonly templateName = signal('');
  readonly busy = signal(false);

  readonly keyOptions = computed(() => {
    const keys = [...this.suggestions(), ...this.headers().map(row => row.key)].filter(key => !!key);
    return Array.from(new Set(keys));
  });

  readonly modified = computed(() => this.templateId() !== null && !sameHeaders(this.headers(), this.baseline()));
  readonly canSaveTemplate = computed(() => filledHeaders(this.headers()).length > 0);

  readonly nameError = computed(() => {
    const name = this.templateName().trim();
    if (!name) {
      return 'Name is required.';
    }
    if (name.length > 255) {
      return 'Name is too long.';
    }
    return this.templates().some(template => template.name === name) ? 'Name already exists.' : null;
  });

  // what is typed in the key of a row, for when the row loses focus before the typed name is chosen
  private readonly typedKeys = new Map<number, string>();

  ngOnInit(): void {
    if (this.templatesEnabled()) {
      this.refreshTemplates();
    }
  }

  patch(index: number, change: Partial<SendHeader>): void {
    this.headers.update(rows => rows.map((row, i) => (i === index ? { ...row, ...change } : row)));
  }

  setKey(index: number, key: string | null): void {
    this.typedKeys.delete(index);
    this.patch(index, { key: key ?? '' });
  }

  onKeySearch(index: number, event: { term: string }): void {
    this.typedKeys.set(index, event.term);
  }

  /** A typed name that was not confirmed with Enter or Tab is still the name the user meant. */
  onKeyBlur(index: number): void {
    const typed = this.typedKeys.get(index)?.trim();
    this.typedKeys.delete(index);
    if (typed && this.headers()[index] && typed !== this.headers()[index].key) {
      this.patch(index, { key: typed });
    }
  }

  add(): void {
    this.headers.update(rows => [...rows, emptyHeader()]);
  }

  remove(index: number): void {
    this.typedKeys.clear();
    this.headers.update(rows => rows.filter((_, i) => i !== index));
  }

  /** Enter in the value of the last row starts a new row. */
  onEnter(index: number, event: Event): void {
    event.preventDefault();
    if (index === this.headers().length - 1) {
      this.add();
    }
  }

  refreshTemplates(): void {
    this.templateService.list().subscribe({
      next: templates => this.templates.set(templates),
      error: () => this.templates.set([]),
    });
  }

  /** Copies the headers of the template into the rows. Without a template the rows stay as they are. */
  selectTemplate(id: number | null): void {
    this.namingTemplate.set(false);
    if (id === null || id === undefined) {
      this.templateId.set(null);
      this.baseline.set([]);
      return;
    }
    this.busy.set(true);
    this.templateService.load(id).subscribe({
      next: rows => {
        this.templateId.set(id);
        this.baseline.set(rows);
        this.headers.set(rows.map(row => ({ ...row })));
        this.busy.set(false);
      },
      error: error => this.failed('Loading the template failed', error),
    });
  }

  startNamingTemplate(): void {
    this.templateName.set('');
    this.namingTemplate.set(true);
  }

  cancelNamingTemplate(): void {
    this.namingTemplate.set(false);
  }

  saveAsTemplate(): void {
    if (this.nameError() || !this.canSaveTemplate()) {
      return;
    }
    this.busy.set(true);
    this.templateService.create(this.templateName().trim(), this.headers()).subscribe({
      next: ({ id, rows }) => {
        this.templateId.set(id);
        this.baseline.set(rows);
        this.headers.set(rows.map(row => ({ ...row })));
        this.namingTemplate.set(false);
        this.busy.set(false);
        this.refreshTemplates();
        this.alertService.addAlert({ type: 'success', message: 'Template saved' });
      },
      error: error => this.failed('Saving the template failed', error),
    });
  }

  updateTemplate(): void {
    const id = this.templateId();
    if (id === null) {
      return;
    }
    this.busy.set(true);
    this.templateService.update(id, this.baseline(), this.headers()).subscribe({
      next: rows => {
        this.baseline.set(rows);
        this.headers.set(rows.map(row => ({ ...row })));
        this.busy.set(false);
        this.alertService.addAlert({ type: 'success', message: 'Template updated' });
      },
      error: error => this.failed('Updating the template failed', error),
    });
  }

  private failed(message: string, error: unknown): void {
    this.busy.set(false);
    this.alertService.addAlert({ type: 'danger', message: `${message}${(error as { message?: string })?.message ? `: ${(error as { message: string }).message}` : ''}` });
  }
}
