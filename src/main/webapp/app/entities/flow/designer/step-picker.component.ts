import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { Components } from 'app/shared/camel/component-type';
import { CatalogueEntry, CategoryChip, NO_MATCH, categoryChips, labelsOf, matchRank, roleMismatch, searchCatalogue } from 'app/shared/camel/catalogue';

import { ROUTER_KINDS } from './flow-graph';

export type PickedKind = 'ACTION' | 'ROUTER' | 'SINK';

/** The components a user can choose from, per kind of Step. */
export interface StepComponents {
  actions: string[];
  sinks: string[];
}

/** The chip for the components this browser picked last; the only list that isn't from the catalogue. */
export const RECENT = 'recent';
const RECENT_KEY = 'step-picker.recent';
const RECENT_MAX = 8;
const CHIPS_SHOWN = 6;

/**
 * The + button on the canvas: it opens a menu to choose the next Step's kind (Action, Router or Sink)
 * and its component in one go. Components show the catalogue's title and description, can be narrowed by the
 * catalogue's categories, and search covers title, id and description.
 */
@Component({
  selector: 'jhi-step-picker',
  templateUrl: './step-picker.component.html',
  styleUrl: './step-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgbDropdownModule, FontAwesomeModule],
})
export class StepPickerComponent implements OnChanges {
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
  private readonly catalogue = new Map<string, CatalogueEntry>(inject(Components).types.map(type => [type.name, type]));
  private readonly chipsByKind = new Map<PickedKind, { shown: CategoryChip[]; more: CategoryChip[] }>();

  activeKind?: PickedKind;
  filter = '';
  /** A catalogue label or RECENT; null shows every component. */
  category: string | null = null;
  showAllCategories = false;
  recent: string[] = readRecent();

  ngOnChanges(): void {
    this.chipsByKind.clear();
  }

  entry(name: string): CatalogueEntry {
    return this.catalogue.get(name) ?? { name };
  }

  /** The category chips of a kind of Step, from the labels of the components it can use. */
  chips(kind: PickedKind): { shown: CategoryChip[]; more: CategoryChip[] } {
    let chips = this.chipsByKind.get(kind);
    if (!chips) {
      chips = kind === 'ROUTER' ? { shown: [], more: [] } : categoryChips(this.componentsOf(kind).map(name => this.entry(name)), CHIPS_SHOWN);
      this.chipsByKind.set(kind, chips);
    }
    return chips;
  }

  recentOf(kind: PickedKind): string[] {
    const names = new Set(this.componentsOf(kind));
    return this.recent.filter(name => names.has(name));
  }

  chooseCategory(category: string): void {
    this.category = this.category === category ? null : category;
    this.search?.nativeElement.focus({ preventScroll: true });
  }

  get kind(): PickedKind {
    return this.activeKind && this.kinds.includes(this.activeKind) ? this.activeKind : this.kinds[0];
  }

  /** The components of a kind in the chosen category that match the search, closest match first. */
  matches(kind: PickedKind): string[] {
    let names = this.componentsOf(kind);
    if (this.category === RECENT) {
      names = this.recentOf(kind);
    } else if (this.category && kind !== 'ROUTER') {
      names = names.filter(name => labelsOf(this.entry(name)).includes(this.category!));
    }
    return searchCatalogue(names.map(name => this.entry(name)), this.filter).map(entry => entry.name);
  }

  /**
   * Components the search finds that this kind of Step can't use, with the reason, so nothing Camel offers is hidden.
   * Only shown while searching.
   */
  hiddenMatches(kind: PickedKind): { name: string; reason: string }[] {
    if (!this.filter.trim() || kind === 'ROUTER') {
      return [];
    }
    const usable = new Set(this.componentsOf(kind));
    const others = [...this.catalogue.values()].filter(entry => !usable.has(entry.name));
    return searchCatalogue(others, this.filter).map(entry => ({
        name: entry.name,
        reason: roleMismatch(entry, 'producer') ?? `${entry.title ?? entry.name} isn't available for this Step.`,
      }));
  }

  /** Opens the menu without a click, for the keyboard. */
  open(): void {
    this.dropdown?.open();
    this.cdr.markForCheck();
  }

  onOpenChange(open: boolean): void {
    if (open) {
      this.filter = '';
      this.category = null;
      this.showAllCategories = false;
      this.recent = readRecent();
      // The field can only take focus once the open menu is rendered. Without preventScroll the browser would
      // scroll the canvas to show the field, which throws off where Foblex draws Links.
      afterNextRender(() => this.search?.nativeElement.focus({ preventScroll: true }), { injector: this.injector });
    }
  }

  /** Enter picks the closest match, from the chosen kind unless another kind has a closer one. */
  pickFirstMatch(): void {
    let best: { kind: PickedKind; name: string; rank: number } | undefined;
    for (const kind of [this.kind, ...this.kinds]) {
      const name = this.matches(kind)[0];
      const rank = name === undefined ? NO_MATCH : this.filter.trim() ? matchRank(this.entry(name), this.filter) : 0;
      if (name !== undefined && (!best || rank < best.rank)) {
        best = { kind, name, rank };
      }
    }
    if (best) {
      this.pick(best.kind, best.name);
    }
  }

  pick(kind: PickedKind, componentType: string): void {
    this.dropdown?.close();
    if (kind !== 'ROUTER') {
      this.recent = [componentType, ...this.recent.filter(name => name !== componentType)].slice(0, RECENT_MAX);
      writeRecent(this.recent);
    }
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

/** Recently used components are kept per browser; without storage the picker simply has no Recently used chip. */
function readRecent(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((name): name is string => typeof name === 'string') : [];
  } catch {
    return [];
  }
}

function writeRecent(names: string[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(names));
  } catch {
    // Storage is unavailable or full; Recently used is a convenience.
  }
}
