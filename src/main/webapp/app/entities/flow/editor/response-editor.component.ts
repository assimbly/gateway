import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ResponseSettings, responseOptions, responseSettings } from '../designer/response';

/**
 * The right-hand panel for a Response: the status (one of the Operation's Declared responses, or any number), header
 * rows, and the body: an expression with its language, or the current body kept.
 */
@Component({
  selector: 'jhi-response-editor',
  templateUrl: './response-editor.component.html',
  imports: [FormsModule, FontAwesomeModule],
})
export class ResponseEditorComponent implements OnChanges {
  /** The Response Step's uri (its body) and options (status, language and headers). */
  @Input() uri?: string | null;
  @Input() options?: string | null;
  @Input() declaredStatuses: string[] = [];
  /** The Operation's response media type, sent as Content-Type unless a header sets it. */
  @Input() responseMediaType?: string;
  @Input() warning?: string;
  @Input() problem?: string;
  @Input() deletable = false;

  @Output() settingsChange = new EventEmitter<{ uri: string | undefined; options: string }>();
  @Output() remove = new EventEmitter<void>();

  readonly languages = ['simple', 'constant', 'jsonpath', 'xpath', 'groovy'];

  settings!: ResponseSettings;
  keepBody = true;

  ngOnChanges(): void {
    this.settings = responseSettings({ uri: this.uri, options: this.options });
    this.keepBody = !this.settings.body;
  }

  get statusChoices(): string[] {
    return this.declaredStatuses.filter(status => status !== 'default');
  }

  get statusValid(): boolean {
    return /^[1-5]\d\d$/.test(this.settings.status);
  }

  get contentTypeSet(): boolean {
    return this.settings.headers.some(header => header.name.trim().toLowerCase() === 'content-type');
  }

  setKeepBody(keep: boolean): void {
    this.keepBody = keep;
    if (keep) {
      this.settings.body = undefined;
    } else {
      this.settings.language ??= 'simple';
    }
    this.emit();
  }

  addHeader(): void {
    this.settings.headers = [...this.settings.headers, { name: '', value: '' }];
  }

  removeHeader(index: number): void {
    this.settings.headers = this.settings.headers.filter((_, i) => i !== index);
    this.emit();
  }

  emit(): void {
    this.settingsChange.emit(responseOptions(this.settings));
  }
}
