import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnChanges,
  ViewChild,
  afterNextRender,
  inject,
  output,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { Components } from 'app/shared/camel/component-type';
import {
  CatalogueEntry,
  CategoryChip,
  ESSENTIALS,
  NO_MATCH,
  categoryChips,
  categoryTitle,
  isEssential,
  labelsOf,
  matchRank,
  roleMismatch,
  searchCatalogue,
} from 'app/shared/camel/catalogue';

import { RESPONSE_COMPONENT, ROUTER_KINDS, routerKindDescription, routerKindTitle } from './flow-graph';

export type PickedKind = 'ACTION' | 'ROUTER' | 'SINK';

/** One line in the list: a component, and the kind of Step it adds. */
export interface PickerItem {
  kind: PickedKind;
  name: string;
}

/** The components a user can choose from, per kind of Step. */
export interface StepComponents {
  actions: string[];
  sinks: string[];
}

/** The chip for the components this browser picked last; the only list that isn't from the catalogue. */
export const RECENT = 'recent';
/** The chip that narrows the list to the Routers, which are otherwise listed among the Actions. */
export const ROUTER_CATEGORY = 'router';
const RECENT_KEY = 'step-picker.recent';
const RECENT_MAX = 8;
const CHIPS_SHOWN = 6;
/** The menu always opens below the +; it shrinks to the room left in the window, but not below this. */
const MIN_MENU_HEIGHT = 240;
const MENU_MARGIN = 12;

/** Entries the designer offers that aren't Camel components of their own. */
const DESIGNER_ENTRIES: Record<string, CatalogueEntry> = {
  [RESPONSE_COMPONENT]: {
    name: RESPONSE_COMPONENT,
    title: 'Response',
    description: 'Ends the request: the status code, headers and body the caller gets.',
    label: 'core',
  },
};

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
  imports: [FormsModule, NgbDropdownModule, FontAwesomeModule],
})
export class StepPickerComponent implements OnChanges {
  readonly kinds = input.required<PickedKind[]>();
  readonly components = input.required<StepComponents>();
  readonly title = input('Add a Step');
  /** Where this + adds a Step, such as `after:<step key>` or `link:<key of the Step the Link leads to>`. */
  readonly target = input<string>();

  readonly picked = output<{ kind: PickedKind; componentType: string }>();

  @ViewChild('search') search?: ElementRef<HTMLInputElement>;
  @ViewChild('toggle') toggle?: ElementRef<HTMLButtonElement>;
  @ViewChild(NgbDropdown) dropdown?: NgbDropdown;

  readonly labels: Record<PickedKind, string> = { ACTION: 'Action', ROUTER: 'Router', SINK: 'Sink' };
  readonly routerCategory = ROUTER_CATEGORY;
  readonly categoryTitle = categoryTitle;
  readonly routerCount = ROUTER_KINDS.length;

  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly catalogue = new Map<string, CatalogueEntry>(inject(Components).types.map(type => [type.name, type]));
  private readonly chipsByKind = new Map<PickedKind, { shown: CategoryChip[]; more: CategoryChip[] }>();

  activeKind?: PickedKind;
  filter = '';
  readonly essentials = ESSENTIALS;
  /** A catalogue label, ESSENTIALS or RECENT; null shows every component. */
  category: string | null = null;
  showAllCategories = false;
  recent: string[] = readRecent();
  /** The menu's height limit, so it fits below the + where the window allows. */
  maxHeight?: number;

  ngOnChanges(): void {
    this.chipsByKind.clear();
  }

  /** How a component is shown; a Router kind is shown by its own name, not by a catalogue component of the same id. */
  entry(name: string, kind?: PickedKind): CatalogueEntry {
    if (kind === 'ROUTER') {
      return { name, title: routerKindTitle(name), description: routerKindDescription(name) };
    }
    return DESIGNER_ENTRIES[name] ?? this.catalogue.get(name) ?? { name };
  }

  /** The category chips of a kind of Step, from the labels of the components it can use. */
  chips(kind: PickedKind): { shown: CategoryChip[]; more: CategoryChip[] } {
    let chips = this.chipsByKind.get(kind);
    if (!chips) {
      chips =
        kind === 'ROUTER'
          ? { shown: [], more: [] }
          : categoryChips(
              this.componentsOf(kind).map(name => this.entry(name)),
              CHIPS_SHOWN,
            );
      this.chipsByKind.set(kind, chips);
    }
    return chips;
  }

  /** Assimbly's own Actions that work on the message; only Actions offer them as a chip. */
  essentialsOf(kind: PickedKind): string[] {
    return kind === 'ACTION' ? this.componentsOf(kind).filter(name => isEssential(this.entry(name))) : [];
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
    const tabs = this.tabs;
    return this.activeKind && tabs.includes(this.activeKind) ? this.activeKind : tabs[0];
  }

  /** The tabs to choose from: Routers are listed among the Actions, so they only get a tab of their own without Actions. */
  get tabs(): PickedKind[] {
    const kinds = this.kinds();
    return kinds.includes('ACTION') ? kinds.filter(kind => kind !== 'ROUTER') : kinds;
  }

  /** Whether the list of a tab holds the Routers: with the Actions, or on its own. */
  listsRouters(tab: PickedKind): boolean {
    return tab === 'ROUTER' || (tab === 'ACTION' && this.kinds().includes('ROUTER'));
  }

  /** Whether the Router chip is offered: only where Routers are listed among other components. */
  offersRouterChip(tab: PickedKind): boolean {
    return tab !== 'ROUTER' && this.listsRouters(tab);
  }

  /**
   * The components of a tab in the chosen category that match the search, closest match first. The Action tab lists
   * the Routers with the Actions; without a search, the Essentials come first, then the Routers. The Router chip
   * narrows the list to the Routers.
   */
  matches(tab: PickedKind): PickerItem[] {
    let names = tab === 'ROUTER' ? [] : this.componentsOf(tab);
    let routerNames = this.listsRouters(tab) ? ROUTER_KINDS : [];
    if (this.category === ROUTER_CATEGORY) {
      names = [];
    } else if (this.category === RECENT) {
      names = this.recentOf(tab);
      routerNames = [];
    } else if (this.category === ESSENTIALS) {
      names = this.essentialsOf(tab);
      routerNames = [];
    } else if (this.category) {
      names = names.filter(name => labelsOf(this.entry(name)).includes(this.category!));
      routerNames = [];
    }
    const components = names.map(name => ({ ...this.entry(name, tab), item: { kind: tab, name } }));
    const routers = routerNames.map(name => ({ ...this.entry(name, 'ROUTER'), item: { kind: 'ROUTER' as PickedKind, name } }));
    const ordered =
      tab === 'ACTION' && !this.filter.trim()
        ? [...components.filter(isEssential), ...routers, ...components.filter(entry => !isEssential(entry))]
        : [...components, ...routers];
    return searchCatalogue(ordered, this.filter).map(entry => entry.item);
  }

  /**
   * Routers the search finds while a tab without Routers is chosen, such as the Sink tab. Users look for something
   * like Split there too, so it is offered rather than shown as a catalogue component that can't be used. Only shown
   * while searching.
   */
  routerMatches(tab: PickedKind): string[] {
    if (!this.filter.trim() || this.listsRouters(tab)) {
      return [];
    }
    return searchCatalogue(
      ROUTER_KINDS.map(name => this.entry(name, 'ROUTER')),
      this.filter,
    ).map(entry => entry.name);
  }

  /**
   * Components the search finds that this kind of Step can't use, with the reason, so nothing Camel offers is hidden.
   * Routers are left to routerMatches, unless this + can't take one. Only shown while searching.
   */
  hiddenMatches(kind: PickedKind): { name: string; kind?: PickedKind; reason: string }[] {
    if (!this.filter.trim() || kind === 'ROUTER') {
      return [];
    }
    const routers = this.kinds().includes('ROUTER')
      ? []
      : this.routerMatches(kind).map(name => ({
          name,
          kind: 'ROUTER' as const,
          reason: `${routerKindTitle(name)} is a Router; a Router can't go here.`,
        }));
    const usable = new Set([...this.componentsOf(kind), ...ROUTER_KINDS]);
    const others = [...this.catalogue.values()].filter(entry => !usable.has(entry.name));
    return [
      ...routers,
      ...searchCatalogue(others, this.filter).map(entry => ({
        name: entry.name,
        reason: roleMismatch(entry, 'producer') ?? `${entry.title ?? entry.name} isn't available for this Step.`,
      })),
    ];
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
      const below = window.innerHeight - (this.toggle?.nativeElement.getBoundingClientRect().bottom ?? 0) - MENU_MARGIN;
      this.maxHeight = Math.max(MIN_MENU_HEIGHT, below);
      // The field can only take focus once the open menu is rendered. Without preventScroll the browser would
      // scroll the canvas to show the field, which throws off where Foblex draws Links.
      afterNextRender(() => this.search?.nativeElement.focus({ preventScroll: true }), { injector: this.injector });
    }
  }

  /** Enter picks the closest match, from the chosen tab unless another tab has a closer one. */
  pickFirstMatch(): void {
    let best: (PickerItem & { rank: number }) | undefined;
    for (const tab of [this.kind, ...this.tabs]) {
      const item = this.matches(tab)[0];
      const rank = item === undefined ? NO_MATCH : this.filter.trim() ? matchRank(this.entry(item.name, item.kind), this.filter) : 0;
      if (item !== undefined && (!best || rank < best.rank)) {
        best = { ...item, rank };
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

  /** The components a tab can use; a Router kind is only listed as a Router, even when the catalogue has a component of that name. */
  private componentsOf(kind: PickedKind): string[] {
    const notRouters = (names: string[]) => names.filter(name => !ROUTER_KINDS.includes(name));
    switch (kind) {
      case 'ROUTER':
        return ROUTER_KINDS;
      case 'SINK':
        return notRouters(this.components().sinks);
      case 'ACTION':
        return notRouters([...new Set(this.components().actions)]);
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
