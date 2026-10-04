import { Component, input } from '@angular/core';

import { StatusControlsTone } from 'app/shared/table';

/** A Flow status (or Draft) in words, with a dot in the status colour. */
@Component({
  selector: 'jhi-flow-status-pill',
  template: '<span class="flow-status-pill" [class]="\'flow-status-pill--\' + tone()">{{ label() }}</span>',
  styleUrl: './flow-status-pill.component.scss',
})
export class FlowStatusPillComponent {
  readonly label = input.required<string>();
  readonly tone = input<StatusControlsTone>('default');
}
