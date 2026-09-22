import { Directive, computed, contentChild, effect, inject, input } from '@angular/core';

import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';

import { SortDirective } from './sort.directive';

@Directive({
  selector: '[jhiSortBy]',
  host: {
    '(click)': 'onClick()',
    '[attr.aria-sort]': 'ariaSort()',
    '[class.table-fx-th-sortable]': 'true',
    '[class.table-fx-th-sorted]': 'isSorted()',
  },
})
export class SortByDirective {
  readonly jhiSortBy = input.required<string>();

  readonly iconComponent = contentChild(FaIconComponent);

  protected sortIcon = faSort;
  protected sortAscIcon = faSortUp;
  protected sortDescIcon = faSortDown;

  private readonly sort = inject(SortDirective, { host: true });

  readonly isSorted = computed(() => {
    const { predicate, order } = this.sort.sortState();
    return predicate === this.jhiSortBy() && order !== undefined;
  });

  readonly ariaSort = computed(() => {
    if (!this.isSorted()) {
      return 'none';
    }
    return this.sort.sortState().order === 'asc' ? 'ascending' : 'descending';
  });

  constructor() {
    effect(() => {
      if (this.iconComponent()) {
        let icon: IconDefinition = this.sortIcon;
        const { predicate, order } = this.sort.sortState();
        if (predicate === this.jhiSortBy() && order !== undefined) {
          icon = order === 'asc' ? this.sortAscIcon : this.sortDescIcon;
        }
        this.iconComponent()!.icon.set(icon.iconName);
      }
    });
  }

  onClick(): void {
    if (this.iconComponent()) {
      this.sort.sort(this.jhiSortBy());
    }
  }
}
