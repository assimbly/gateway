import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AlertService } from 'app/core/util/alert.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { FlowService } from './flow.service';
import { FlowTypeChoicesComponent } from './flow-type-choices.component';

/** Creates a Flow: opens the editor for the chosen Flow type, or imports a Flow from an export file. */
@Component({
  selector: 'jhi-new-flow-dialog',
  templateUrl: './new-flow-dialog.component.html',
  imports: [FontAwesomeModule, FlowTypeChoicesComponent],
})
export class NewFlowDialogComponent {
  integrationId?: number;

  readonly importing = signal<string | null>(null);
  readonly importError = signal<string | null>(null);
  /** An import that would replace the Flow with the same name, waiting for the user to confirm it. */
  readonly pendingReplace = signal<PendingImport | null>(null);

  readonly activeModal = inject(NgbActiveModal);
  private readonly flowService = inject(FlowService);
  private readonly eventManager = inject(EventManager);
  private readonly alertService = inject(AlertService);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  chooseFile(): void {
    this.fileInput().nativeElement.click();
  }

  onFileChosen(event: Event): void {
    const file = takeChosenFile(event);
    if (file) {
      void this.importFile(file);
    }
  }

  async importFile(file: File): Promise<void> {
    this.importError.set(null);
    this.pendingReplace.set(null);
    let xml: string;
    try {
      xml = await readText(file);
    } catch {
      this.importError.set(`Couldn't read ${file.name}.`);
      return;
    }
    const found = flowInExport(xml);
    if (typeof found === 'string') {
      this.importError.set(`${file.name} ${found}`);
      return;
    }
    if (this.integrationId == null) {
      this.importError.set(`Couldn't import ${file.name}: the Gateway has no integration yet. Refresh the list and try again.`);
      return;
    }

    const pending: PendingImport = { fileName: file.name, xml, integrationId: this.integrationId, flow: found };
    this.importing.set(file.name);
    this.flowService.findByName(found.name).subscribe({
      next: () => {
        this.importing.set(null);
        this.pendingReplace.set(pending);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.send(pending, 'Imported');
        } else {
          this.fail(pending.fileName, error);
        }
      },
    });
  }

  confirmReplace(): void {
    const pending = this.pendingReplace();
    if (pending) {
      this.pendingReplace.set(null);
      this.send(pending, 'Replaced');
    }
  }

  cancelReplace(): void {
    this.pendingReplace.set(null);
  }

  private send(pending: PendingImport, verb: 'Imported' | 'Replaced'): void {
    this.importing.set(pending.fileName);
    this.flowService.importFlowConfiguration(pending.integrationId, pending.flow.id, pending.xml).subscribe({
      next: () => {
        this.eventManager.broadcast(new EventWithContent('flowListModification', 'imported'));
        this.alertService.addAlert({ type: 'success', message: `${verb} Flow ${pending.flow.name}` });
        this.activeModal.close();
      },
      error: (error: HttpErrorResponse) => this.fail(pending.fileName, error),
    });
  }

  private fail(fileName: string, error: HttpErrorResponse): void {
    this.importing.set(null);
    const reason = failureMessage(error);
    this.importError.set(`Couldn't import ${fileName}${reason ? `: ${reason}` : '.'}`);
  }
}

interface PendingImport {
  fileName: string;
  xml: string;
  integrationId: number;
  flow: { id: string; name: string };
}

/** The single Flow in a Flow export, or why the file isn't one. */
function flowInExport(xml: string): { id: string; name: string } | string {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    return "isn't an XML file. Choose a file made with a Flow's Export.";
  }
  const flows = Array.from(doc.getElementsByTagName('flow')).filter(flow => flow.parentElement?.localName === 'flows');
  if (flows.length > 1) {
    return `contains ${flows.length} Flows. Import it under Administration → Gateway instead.`;
  }
  const id = flows.length === 1 ? childText(flows[0], 'id') : '';
  const name = flows.length === 1 ? childText(flows[0], 'name') : '';
  if (!/^\d+$/.test(id) || !name) {
    return "doesn't contain a Flow. Choose a file made with a Flow's Export.";
  }
  return { id, name };
}

function childText(element: Element, name: string): string {
  return (
    Array.from(element.children)
      .find(child => child.localName === name)
      ?.textContent?.trim() ?? ''
  );
}

function failureMessage(error: HttpErrorResponse): string {
  if (typeof error.error !== 'string') {
    return '';
  }
  const doc = new DOMParser().parseFromString(error.error, 'application/xml');
  return doc.getElementsByTagName('message')[0]?.textContent?.trim() ?? '';
}

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/** The file picked in a file input, which is then cleared so picking the same file again fires a change. */
export function takeChosenFile(event: Event): File | undefined {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  return file;
}
