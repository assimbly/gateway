import { Component, Input, TemplateRef, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FlowFailure } from './flow-status';

/** The Error and Alert badges of a Flow, in its row and in the editor header. */
@Component({
  selector: 'jhi-flow-row-alerts',
  templateUrl: './flow-row-alerts.component.html',
  imports: [FontAwesomeModule],
  host: { style: 'display: contents' },
})
export class FlowRowAlerts {
  @Input() flowName: string;
  /** Why the Flow didn't start, or null. */
  @Input() failure: FlowFailure | null = null;
  @Input() numberOfAlerts = 0;
  readonly alertsOpen = output<void>();

  constructor(private modalService: NgbModal) {}

  openError(content: TemplateRef<unknown>): void {
    this.modalService.open(content, { centered: true, size: 'lg' });
  }
}
