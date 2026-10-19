import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IFlow } from 'app/shared/model/flow.model';
import { isDraft, loadFlowGraph, opensOnCanvas } from './designer/flow-graph';
import { flowTypeLabel } from './flow-status';
import { FlowService } from './flow.service';

/** The shortest passphrase the export accepts; the Gateway refuses a shorter one too. */
export const MIN_PASSPHRASE_LENGTH = 12;

/** A Flow in the checklist of the export. */
export interface ExportFlow {
  id: number;
  name: string;
  type: 'Visual' | 'Script' | 'Route';
  draft: boolean;
}

/** Why the export can't start yet, or null when it can. */
export function fluxygenExportProblem(selected: number, passphrase: string, confirmation: string): string | null {
  if (!selected) {
    return 'Choose at least one Flow.';
  }
  if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
    return `The passphrase needs at least ${MIN_PASSPHRASE_LENGTH} characters.`;
  }
  if (confirmation !== passphrase) {
    return "The passphrases don't match.";
  }
  return null;
}

/** A Flow as the checklist shows it. A Draft is a Visual Flow whose design isn't finished. */
export function exportFlowOf(flow: IFlow): ExportFlow {
  return {
    id: flow.id!,
    name: flow.name ?? `Flow ${flow.id}`,
    type: flowTypeLabel(flow.type),
    draft: opensOnCanvas(flow.type) && isDraft(loadFlowGraph(flow)),
  };
}

/**
 * Export for Fluxygen: the chosen Flows as a zip that Fluxygen imports, one file per Flow in the `groupless` group,
 * with their secrets encrypted with a passphrase the user types here and again in Fluxygen.
 */
@Component({
  selector: 'jhi-fluxygen-export-dialog',
  templateUrl: './fluxygen-export-dialog.component.html',
  imports: [FormsModule, FontAwesomeModule],
})
export class FluxygenExportDialogComponent {
  readonly minLength = MIN_PASSPHRASE_LENGTH;

  readonly integrationId = signal<number | undefined>(undefined);
  readonly flows = signal<ExportFlow[]>([]);
  readonly selected = signal<ReadonlySet<number>>(new Set());
  readonly passphrase = signal('');
  readonly confirmation = signal('');
  readonly loading = signal(false);
  readonly exporting = signal(false);
  readonly failed = signal<string | null>(null);
  /** Problems show once the user tried to export, not while typing. */
  readonly submitted = signal(false);

  readonly allSelected = computed(() => this.flows().length > 0 && this.selected().size === this.flows().length);
  readonly drafts = computed(() => this.flows().filter(flow => flow.draft && this.selected().has(flow.id)).length);
  readonly problem = computed(() => fluxygenExportProblem(this.selected().size, this.passphrase(), this.confirmation()));

  readonly activeModal = inject(NgbActiveModal);
  private readonly flowService = inject(FlowService);

  /** Opens the dialog for the Flows of the Integration. */
  static open(modalService: NgbModal, integrationId: number): void {
    const ref = modalService.open(FluxygenExportDialogComponent, { size: 'lg', ariaLabelledBy: 'fluxygen-export-title' });
    const dialog: FluxygenExportDialogComponent = ref.componentInstance;
    dialog.integrationId.set(integrationId);
    dialog.load();
  }

  /** Reads the Flows of the Integration; all of them are chosen. */
  load(): void {
    const integrationId = this.integrationId();
    if (integrationId === undefined) {
      return;
    }
    this.loading.set(true);
    this.failed.set(null);
    // The Flows list shows a page; the export offers every Flow.
    this.flowService.getFlowByIntegrationId(integrationId, { page: 0, size: 2000, sort: ['name,asc'] }).subscribe({
      next: response => {
        const flows = (response.body ?? []).filter(flow => flow.id != null).map(exportFlowOf);
        this.flows.set(flows);
        this.selected.set(new Set(flows.map(flow => flow.id)));
        this.loading.set(false);
      },
      error: () => {
        this.failed.set("Couldn't load the Flows.");
        this.loading.set(false);
      },
    });
  }

  isSelected(id: number): boolean {
    return this.selected().has(id);
  }

  toggle(id: number, checked: boolean): void {
    const selected = new Set(this.selected());
    if (checked) {
      selected.add(id);
    } else {
      selected.delete(id);
    }
    this.selected.set(selected);
  }

  toggleAll(checked: boolean): void {
    this.selected.set(new Set(checked ? this.flows().map(flow => flow.id) : []));
  }

  export(): void {
    this.submitted.set(true);
    const integrationId = this.integrationId();
    if (this.problem() || integrationId === undefined || this.exporting()) {
      return;
    }
    this.exporting.set(true);
    this.failed.set(null);
    // Selected in the order of the list, so the zip lists the Flows the way the dialog does.
    const flowIds = this.flows()
      .map(flow => flow.id)
      .filter(id => this.selected().has(id));
    this.flowService.exportForFluxygen(integrationId, flowIds, this.passphrase()).subscribe({
      next: fileName => {
        this.exporting.set(false);
        this.forgetPassphrase();
        this.activeModal.close(fileName);
      },
      error: (error: Error) => {
        this.exporting.set(false);
        this.failed.set(error.message);
      },
    });
  }

  dismiss(): void {
    this.forgetPassphrase();
    this.activeModal.dismiss();
  }

  private forgetPassphrase(): void {
    this.passphrase.set('');
    this.confirmation.set('');
  }
}
