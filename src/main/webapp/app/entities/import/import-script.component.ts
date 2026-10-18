import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { errorMessage } from 'app/entities/api/api.service';

import { DEFAULT_SCRIPT_LANGUAGE, SCRIPT_LANGUAGES } from 'app/entities/flow/editor/script-flow';

import { baseName, languageOfFile } from './import-files';
import { ImportService } from './import.service';
import { ImportSourceComponent } from './import-source.component';

/** Import a script into the script editor: a new Flow with a scheduler Source, the script, a Log Step and an error handler. */
@Component({
  selector: 'jhi-import-script',
  templateUrl: './import-script.component.html',
  styleUrl: './import.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, RouterLink, FontAwesomeModule, ImportSourceComponent],
})
export class ImportScriptComponent {
  private readonly importService = inject(ImportService);

  readonly languages = SCRIPT_LANGUAGES;

  readonly text = signal('');
  readonly fileName = signal<string | undefined>(undefined);
  readonly language = signal(DEFAULT_SCRIPT_LANGUAGE);
  readonly name = signal('');
  readonly importing = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly canImport = computed(() => !!this.text().trim() && !this.importing());

  /** A chosen file suggests the language by its extension, and names the Flow unless the user already did. */
  onFileChosen(file: File): void {
    const language = languageOfFile(file.name);
    if (language) {
      this.language.set(language);
    }
    if (!this.name().trim()) {
      this.name.set(baseName(file.name));
    }
  }

  start(): void {
    this.error.set(undefined);
    this.importing.set(true);
    this.importService.importScript(this.text(), this.language(), this.name()).subscribe({
      next: result => {
        this.importing.set(false);
        void this.importService.open(result);
      },
      error: (error: unknown) => {
        this.importing.set(false);
        this.error.set(`Couldn't import ${this.fileName() ?? 'the script'}: ${errorMessage(error)}`);
      },
    });
  }
}
