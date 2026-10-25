import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FaIconComponent, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { SortByDirective } from './sort-by.directive';
import { sortStateSignal } from './sort-state';
import { SortDirective } from './sort.directive';

@Component({
  imports: [SortDirective, SortByDirective, FaIconComponent],
  template: `
    <table>
      <thead>
        <tr jhiSort [(sortState)]="sortState">
          <th jhiSortBy="name">Name <fa-icon [icon]="'sort'" /></th>
          <th jhiSortBy="notes">Notes</th>
        </tr>
      </thead>
    </table>
  `,
})
class TestHost {
  sortState = sortStateSignal({ predicate: 'id' });

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}

describe('Sortable headers by keyboard', () => {
  let fixture: ComponentFixture<TestHost>;
  let headers: DebugElement[];

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    headers = fixture.debugElement.queryAll(By.directive(SortByDirective));
  });

  it('can be reached with Tab only when the column sorts', () => {
    expect(headers[0].nativeElement.getAttribute('tabindex')).toBe('0');
    expect(headers[1].nativeElement.hasAttribute('tabindex')).toBe(false);
  });

  it('sorts on Enter and Space, and Space does not scroll the page', () => {
    const space = new KeyboardEvent('keydown', { key: ' ', cancelable: true });

    headers[0].nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fixture.componentInstance.sortState()).toEqual({ predicate: 'name', order: 'asc' });

    headers[0].nativeElement.dispatchEvent(space);
    expect(fixture.componentInstance.sortState()).toEqual({ predicate: 'name', order: 'desc' });
    expect(space.defaultPrevented).toBe(true);
  });
});
