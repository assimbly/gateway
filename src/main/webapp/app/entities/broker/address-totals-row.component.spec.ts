import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IAddress } from 'app/shared/model/address.model';
import { AddressTotalsRowComponent } from './address-totals-row.component';

@Component({
  imports: [AddressTotalsRowComponent],
  template: `<table><tfoot><tr jhi-address-totals-row [shown]="shown()" [count]="count()" noun="queues"></tr></tfoot></table>`,
})
class HostComponent {
  readonly shown = signal<IAddress[]>([]);
  readonly count = signal(0);
}

describe('AddressTotalsRowComponent', () => {
  function render(shown: IAddress[], count: number): HTMLTableRowElement {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.shown.set(shown);
    fixture.componentInstance.count.set(count);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('tr');
  }

  const queues: IAddress[] = [
    { name: 'orders', numberOfConsumers: 2, numberOfMessages: 10 },
    { name: 'invoices', numberOfConsumers: 1, numberOfMessages: 1500 },
  ];

  it('shows the totals under the Consumers and Messages columns', () => {
    const cells = render(queues, 2).querySelectorAll('th, td');

    expect(cells[0].textContent!.trim()).toBe('Total');
    expect(cells[1].textContent!.trim()).toBe('3');
    expect(cells[2].textContent!.trim()).toBe('1,510');
    expect(cells.length).toBe(4);
  });

  it('says how many of the rows the totals cover while a filter hides some', () => {
    const label = render([queues[0]], 2).querySelector('th')!;

    expect(label.textContent!.replace(/\s+/g, ' ').trim()).toBe('Total 1 of 2 queues');
  });
});
