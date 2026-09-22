import { Component, computed, contentChildren, Directive } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap/tooltip';

@Directive({
  selector: '[jhiPrimaryAction]',
})
export class PrimaryActionDirective {}

@Directive({
  selector: '[jhiOverflowAction]',
})
export class OverflowActionDirective {}

@Component({
  selector: 'jhi-row-actions',
  imports: [FontAwesomeModule, NgbDropdownModule, NgbTooltip],
  templateUrl: './row-actions.html',
})
export default class RowActions {
  readonly overflowActions = contentChildren(OverflowActionDirective);

  readonly hasOverflow = computed(() => this.overflowActions().length > 0);
}
