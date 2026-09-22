import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

export interface FlowStatsSection {
  title: string;
  rows: Array<{ label: string; value: string }>;
  note?: string;
}

@Component({
  selector: 'jhi-flow-row-stats',
  templateUrl: './flow-row-stats.component.html',
  imports: [CommonModule, FontAwesomeModule, NgbPopoverModule],
  host: { style: 'display: contents' },
})
export class FlowRowStats {
  @Input() loading = false;
  @Input() empty = false;
  @Input() sections: FlowStatsSection[] = [];
  readonly load = output<void>();
}
