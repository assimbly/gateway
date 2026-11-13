import { Component, input } from '@angular/core';

import { FlowStatsSection } from './flow-stats';

/** Stats as titled tables, in the stats popover and on a Flow's stats page. */
@Component({
  selector: 'jhi-flow-stats-sections',
  templateUrl: './flow-stats-sections.component.html',
  imports: [],
})
export class FlowStatsSections {
  readonly loading = input(false);
  readonly empty = input(false);
  readonly emptyMessage = input('There are no stats yet.');
  readonly sections = input<FlowStatsSection[]>([]);
}
