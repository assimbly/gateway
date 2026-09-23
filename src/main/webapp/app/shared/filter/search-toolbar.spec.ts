import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

import SearchToolbar from './search-toolbar';

describe('SearchToolbar', () => {
  let fixture: ComponentFixture<SearchToolbar>;
  let comp: SearchToolbar;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SearchToolbar],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faSearch, faTimes);

    fixture = TestBed.createComponent(SearchToolbar);
    comp = fixture.componentInstance;
    fixture.componentRef.setInput('placeholder', 'Filter by name');
    fixture.detectChanges();
  });

  it('renders the placeholder', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('Filter by name');
  });

  it('updates query as the user types', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'orders';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(comp.query()).toBe('orders');
  });

  it('clears the query from the clear button', () => {
    comp.query.set('orders');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear filter"]') as HTMLButtonElement;
    clearButton.click();
    fixture.detectChanges();

    expect(comp.query()).toBe('');
  });

  it('clears the query on Escape', () => {
    comp.query.set('orders');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(comp.query()).toBe('');
  });

  it('restores and writes the query when persistKey is set', () => {
    localStorage.setItem('searchQueueText', 'saved');

    const persistedFixture = TestBed.createComponent(SearchToolbar);
    persistedFixture.componentRef.setInput('persistKey', 'searchQueueText');
    persistedFixture.detectChanges();

    expect(persistedFixture.componentInstance.query()).toBe('saved');

    persistedFixture.componentInstance.onQueryChange('next');
    expect(localStorage.getItem('searchQueueText')).toBe('next');
  });
});
