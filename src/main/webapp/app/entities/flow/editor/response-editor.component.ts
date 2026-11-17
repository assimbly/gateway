import { Component, OnChanges, output, input } from '@angular/core';
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
  readonly uri = input<string | null>();
  readonly options = input<string | null>();
  readonly declaredStatuses = input<string[]>([]);
  /** The Operation's response media type, sent as Content-Type unless a header sets it. */
  readonly responseMediaType = input<string>();
  readonly warning = input<string>();
  readonly problem = input<string>();
  readonly deletable = input(false);

  readonly settingsChange = output<{ uri: string | undefined; options: string }>();
  readonly remove = output<void>();

  readonly languages = ['simple', 'constant', 'jsonpath', 'xpath', 'groovy'];

  settings!: ResponseSettings;
  keepBody = true;

  ngOnChanges(): void {
    this.settings = responseSettings({ uri: this.uri(), options: this.options() });
    this.keepBody = !this.settings.body;
  }

  get statusChoices(): string[] {
    return this.declaredStatuses().filter(status => status !== 'default');
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
