import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ROUTER_KINDS } from './flow-graph';

export type PickedKind = 'ACTION' | 'ROUTER' | 'SINK';

/** The components a user can choose from, per kind of Step. */
export interface StepComponents {
  actions: string[];
  sinks: string[];
}

/**
 * The + button on the canvas: it opens a menu to choose the next Step's kind (Action, Router or Sink)
 * and its component in one go, with a search filter.
 */
@Component({
  selector: 'jhi-step-picker',
  templateUrl: './step-picker.component.html',
  styleUrl: './step-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgbDropdownModule, FontAwesomeModule],
})
export class StepPickerComponent {
  @Input({ required: true }) kinds: PickedKind[] = [];
  @Input({ required: true }) components: StepComponents = { actions: [], sinks: [] };
  @Input() title = 'Add a Step';
  /** Where this + adds a Step, such as `after:<step key>` or `link:<key of the Step the Link leads to>`. */
  @Input() target?: string;

  @Output() picked = new EventEmitter<{ kind: PickedKind; componentType: string }>();

  @ViewChild('search') search?: ElementRef<HTMLInputElement>;
  @ViewChild(NgbDropdown) dropdown?: NgbDropdown;

  readonly labels: Record<PickedKind, string> = { ACTION: 'Action', ROUTER: 'Router', SINK: 'Sink' };

  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);

  activeKind?: PickedKind;
  filter = '';

  get kind(): PickedKind {
    return this.activeKind && this.kinds.includes(this.activeKind) ? this.activeKind : this.kinds[0];
  }

  /** The components of a kind that match the search filter: an exact match first, then names that start with it. */
  matches(kind: PickedKind): string[] {
    const filter = this.filter.trim().toLowerCase();
    const rank = (name: string): number => (name === filter ? 0 : name.startsWith(filter) ? 1 : 2);
    return this.componentsOf(kind)
      .filter(name => name.toLowerCase().includes(filter))
      .sort((a, b) => rank(a.toLowerCase()) - rank(b.toLowerCase()));
  }

  /** Opens the menu without a click, for the keyboard. */
  open(): void {
    this.dropdown?.open();
    this.cdr.markForCheck();
  }

  onOpenChange(open: boolean): void {
    if (open) {
      this.filter = '';
      // The field can only take focus once the open menu is rendered. Without preventScroll the browser would
      // scroll the canvas to show the field, which throws off where Foblex draws Links.
      afterNextRender(() => this.search?.nativeElement.focus({ preventScroll: true }), { injector: this.injector });
    }
  }

  /** Enter picks the first match, looking in the other kinds when the chosen kind has none. */
  pickFirstMatch(): void {
    const kind = [this.kind, ...this.kinds].find(k => this.matches(k).length);
    if (kind) {
      this.pick(kind, this.matches(kind)[0]);
    }
  }

  pick(kind: PickedKind, componentType: string): void {
    this.dropdown?.close();
    this.picked.emit({ kind, componentType });
  }

  private componentsOf(kind: PickedKind): string[] {
    switch (kind) {
      case 'ROUTER':
        return ROUTER_KINDS;
      case 'SINK':
        return this.components.sinks;
      case 'ACTION':
        return [...new Set(this.components.actions)];
    }
  }
}
