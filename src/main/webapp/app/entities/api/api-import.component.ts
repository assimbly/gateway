import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { IApiImportResult } from './api.model';
import { ApiService, errorMessage } from './api.service';

/**
 * Import OpenAPI: an OpenAPI 3.0 or 3.1 document (JSON or YAML), uploaded or pasted, becomes a new API with a Draft
 * Handler Flow per Operation. The result lists what the API model doesn't hold.
 */
@Component({
  selector: 'jhi-api-import',
  templateUrl: './api-import.component.html',
  styleUrl: './api.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, RouterModule, FontAwesomeModule],
})
export class ApiImportComponent {
  private readonly apiService = inject(ApiService);

  document = '';
  fileName?: string;
  readonly importing = signal(false);
  readonly result = signal<IApiImportResult | undefined>(undefined);
  readonly error = signal<string | undefined>(undefined);

  readFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    this.fileName = file.name;
    file.text().then(text => (this.document = text));
  }

  importDocument(): void {
    this.importing.set(true);
    this.error.set(undefined);
    this.result.set(undefined);
    this.apiService.importDocument(this.document).subscribe({
      next: result => {
        this.importing.set(false);
        this.result.set(result);
      },
      error: error => {
        this.importing.set(false);
        this.error.set(errorMessage(error));
      },
    });
  }
}
