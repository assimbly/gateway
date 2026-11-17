import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { errorMessage } from 'app/entities/api/api.service';
import { FlowService } from 'app/entities/flow/flow.service';

import { flowInExport } from './import-files';
import { ImportConflict } from './import.model';
import { ImportService } from './import.service';
import { ImportSourceComponent } from './import-source.component';

/** Import a Flow from a DIL export (the Flow list's Export) into the visual editor. */
@Component({
  selector: 'jhi-import-flow',
  templateUrl: './import-flow.component.html',
  styleUrl: './import.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, FontAwesomeModule, ImportSourceComponent],
})
export class ImportFlowComponent {
  private readonly importService = inject(ImportService);
  private readonly flowService = inject(FlowService);

  readonly text = signal('');
  readonly fileName = signal<string | undefined>(undefined);
  readonly importing = signal(false);
  readonly error = signal<string | undefined>(undefined);
  /** The name of an existing Flow the import would replace, waiting for the user to choose what to do. */
  readonly conflict = signal<string | undefined>(undefined);
  readonly canImport = computed(() => !!this.text().trim() && !this.importing() && !this.conflict());

  start(): void {
    this.error.set(undefined);
    this.conflict.set(undefined);

    const found = flowInExport(this.text());
    if (typeof found === 'string') {
      this.error.set(`${this.fileName() ?? 'The text'} ${found}`);
      return;
    }

    this.importing.set(true);
    this.flowService.findByName(found.name).subscribe({
      next: () => {
        this.importing.set(false);
        this.conflict.set(found.name);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.send('replace');
        } else {
          this.fail(error);
        }
      },
    });
  }

  send(onConflict: ImportConflict): void {
    this.conflict.set(undefined);
    this.error.set(undefined);
    this.importing.set(true);
    this.importService.importFlow(this.text(), onConflict).subscribe({
      next: result => {
        this.importing.set(false);
        void this.importService.open(result);
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  cancelConflict(): void {
    this.conflict.set(undefined);
  }

  private fail(error: unknown): void {
    this.importing.set(false);
    this.error.set(`Couldn't import ${this.fileName() ?? 'the Flow'}: ${errorMessage(error)}`);
  }
}
