import { Component, input, model, output } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SortByDirective, SortDirective, SortState } from 'app/shared/sort';

import { DataTableColumn } from './data-table.model';

@Component({
  selector: 'jhi-data-table',
  imports: [FontAwesomeModule, SortDirective, SortByDirective],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export default class DataTable {
  readonly columns = input<DataTableColumn[]>([]);
  readonly sortState = model<SortState>({});
  readonly loading = input(false);
  readonly hasRows = input(false);
  readonly errorMessage = input('');
  readonly emptyMessage = input('No items found');
  readonly ariaLabel = input('Items');
  readonly skeletonRows = input(5);

  readonly sortChange = output<SortState>();

  isEnd(column: DataTableColumn): boolean {
    return column.align === 'end' || !!column.numeric;
  }

  onSortChange(state: SortState): void {
    this.sortChange.emit(state);
  }

  skeletonIndexes(): number[] {
    return Array.from({ length: this.skeletonRows() }, (_, index) => index);
  }
}
