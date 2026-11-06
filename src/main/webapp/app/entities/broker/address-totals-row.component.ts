import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IAddress } from 'app/shared/model/address.model';
import { totalAddresses } from 'app/shared/util/address-filter';

/** The footer of the Queues or Topics list: the Consumers and Messages of the rows shown, added up. */
@Component({
  selector: '[jhi-address-totals-row]',
  imports: [DecimalPipe],
  template: `
    <th scope="row">
      Total
      @if (isFiltered()) {
        <span class="table-fx-total-scope">{{ shown().length }} of {{ count() }} {{ noun() }}</span>
      }
    </th>
    <td class="text-end table-fx-numeric">{{ totals().consumers | number }}</td>
    <td class="text-end table-fx-numeric">{{ totals().messages | number }}</td>
    <td></td>
  `,
})
export class AddressTotalsRowComponent {
  /** The Queues or Topics in the list now, after the filter. */
  readonly shown = input<IAddress[]>([]);
  /** How many Queues or Topics there are without the filter. */
  readonly count = input(0);
  readonly noun = input('queues');

  readonly totals = computed(() => totalAddresses(this.shown()));
  readonly isFiltered = computed(() => this.shown().length < this.count());
}
