import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlowStatsSection } from './flow-stats';

/** Stats as titled tables, in the stats popover and on a Flow's stats page. */
@Component({
  selector: 'jhi-flow-stats-sections',
  templateUrl: './flow-stats-sections.component.html',
  imports: [CommonModule],
})
export class FlowStatsSections {
  @Input() loading = false;
  @Input() empty = false;
  @Input() emptyMessage = 'There are no stats yet.';
  @Input() sections: FlowStatsSection[] = [];
}
