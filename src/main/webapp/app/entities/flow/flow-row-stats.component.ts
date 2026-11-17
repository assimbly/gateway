import { Component, output, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { FlowStatsSection } from './flow-stats';
import { FlowStatsSections } from './flow-stats-sections.component';

@Component({
  selector: 'jhi-flow-row-stats',
  templateUrl: './flow-row-stats.component.html',
  imports: [RouterLink, FontAwesomeModule, NgbPopoverModule, FlowStatsSections],
  host: { style: 'display: contents' },
})
export class FlowRowStats {
  readonly loading = input(false);
  readonly empty = input(false);
  readonly sections = input<FlowStatsSection[]>([]);
  /** Where Show details leads: the stats of each Step, for a Flow drawn on the canvas. */
  readonly detailsLink = input<unknown[]>();
  readonly load = output<void>();
}
