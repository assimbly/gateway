import { Component, computed, input } from '@angular/core';

import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap/tooltip';

@Component({
  selector: 'jhi-truncate',
  imports: [NgbTooltip],
  template: `
    <span
      class="table-fx-truncate"
      [ngbTooltip]="displayText()"
      [disableTooltip]="displayText().length < 28"
      container="body"
      placement="top"
      >{{ displayText() }}</span
    >
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
  `,
})
export default class Truncate {
  readonly text = input<string | number | null | undefined>('');
  readonly displayText = computed(() => {
    const value = this.text();
    return value == null ? '' : String(value);
  });
}
