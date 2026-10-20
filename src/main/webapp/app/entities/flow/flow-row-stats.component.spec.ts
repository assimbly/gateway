import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideRouter } from '@angular/router';
import { faArrowRight, faChartBar } from '@fortawesome/free-solid-svg-icons';

import { FlowRowStats } from './flow-row-stats.component';
import { FlowStatsSection } from './flow-stats';

const sections: FlowStatsSection[] = [
  { title: 'Runtime', rows: [{ label: 'Status', values: ['Started'] }] },
  {
    title: 'Messages',
    columns: ['Transactions', 'Exchanges'],
    rows: [
      { label: 'Total', values: ['3', '9'] },
      { label: 'Failed', values: ['1', '2'] },
    ],
    note: 'A transaction counts a message once.',
  },
];

describe('Flow stats popover', () => {
  let fixture: ComponentFixture<FlowRowStats>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.inject(FaIconLibrary).addIcons(faChartBar, faArrowRight);
    fixture = TestBed.createComponent(FlowRowStats);
    fixture.componentRef.setInput('sections', sections);
    fixture.detectChanges();
  });

  function openPopover(): HTMLElement {
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    fixture.detectChanges();
    return document.querySelector('.flow-stats-popover') as HTMLElement;
  }

  afterEach(() => document.querySelectorAll('.flow-stats-popover').forEach(popover => popover.remove()));

  it('shows transactions and exchanges side by side', () => {
    const popover = openPopover();
    const messages = popover.querySelectorAll('.flow-stats-section')[1];

    const header = [...messages.querySelectorAll('thead th')].map(cell => cell.textContent!.trim());
    const rows = [...messages.querySelectorAll('tbody tr')].map(row =>
      [...row.querySelectorAll('th, td')].map(cell => cell.textContent!.trim()),
    );

    expect(header).toEqual(['Transactions', 'Exchanges']);
    expect(rows).toEqual([
      ['Total', '3', '9'],
      ['Failed', '1', '2'],
    ]);
    expect(messages.querySelector('.flow-stats-note')!.textContent).toContain('once');
  });

  it('shows a single value table without a header', () => {
    const runtime = openPopover().querySelector('.flow-stats-section')!;

    expect(runtime.querySelector('thead')).toBeNull();
    expect(runtime.querySelector('tbody td')!.textContent!.trim()).toBe('Started');
  });

  it('links to the stats of each Step when it is given where they are', () => {
    expect(openPopover().querySelector('.flow-stats-details')).toBeNull();
    document.querySelectorAll('.flow-stats-popover').forEach(popover => popover.remove());

    fixture = TestBed.createComponent(FlowRowStats);
    fixture.componentRef.setInput('sections', sections);
    fixture.componentRef.setInput('detailsLink', ['/flow', 7, 'stats']);
    fixture.detectChanges();

    const link = openPopover().querySelector<HTMLAnchorElement>('.flow-stats-details')!;
    expect(link.textContent).toContain('Show details');
    expect(link.getAttribute('href')).toBe('/flow/7/stats');
  });

  it('offers no details while there are no stats', () => {
    fixture.componentRef.setInput('detailsLink', ['/flow', 7, 'stats']);
    fixture.componentRef.setInput('empty', true);
    fixture.detectChanges();

    expect(openPopover().querySelector('.flow-stats-details')).toBeNull();
  });
});
