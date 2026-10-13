import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { errorMessage } from 'app/entities/api/api.service';

import { baseName, xmlProblem } from './import-files';
import { ImportService } from './import.service';
import { ImportSourceComponent } from './import-source.component';

/** Import Camel XML (a route, routes or a camelContext) into the route editor. */
@Component({
  selector: 'jhi-import-camel',
  templateUrl: './import-camel.component.html',
  styleUrl: './import.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, RouterLink, FontAwesomeModule, ImportSourceComponent],
})
export class ImportCamelComponent {
  private readonly importService = inject(ImportService);

  readonly text = signal('');
  readonly fileName = signal<string | undefined>(undefined);
  readonly name = signal('');
  readonly importing = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly canImport = computed(() => !!this.text().trim() && !this.importing());

  /** A chosen file names the Flow, unless the user already did. */
  onFileChosen(file: File): void {
    if (!this.name().trim()) {
      this.name.set(baseName(file.name));
    }
  }

  start(): void {
    this.error.set(undefined);

    const problem = xmlProblem(this.text());
    if (problem) {
      this.error.set(`${this.fileName() ?? 'The text'} ${problem}`);
      return;
    }

    this.importing.set(true);
    this.importService.importCamel(this.text(), this.name()).subscribe({
      next: result => {
        this.importing.set(false);
        void this.importService.open(result);
      },
      error: (error: unknown) => {
        this.importing.set(false);
        this.error.set(`Couldn't import ${this.fileName() ?? 'the routes'}: ${errorMessage(error)}`);
      },
    });
  }
}
