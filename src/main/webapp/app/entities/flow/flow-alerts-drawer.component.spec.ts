import 'app/config/dayjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { parseAlert } from './flow-alerts';
import { FlowAlertsDrawerComponent } from './flow-alerts-drawer.component';

describe('Flow alerts drawer', () => {
  let fixture: ComponentFixture<FlowAlertsDrawerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlowAlertsDrawerComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NgbActiveOffcanvas, useValue: { dismiss: jest.fn() } },
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(FlowAlertsDrawerComponent);
  });

  function show(...lines: string[]): HTMLElement[] {
    fixture.componentInstance.alerts.set(lines.map(parseAlert));
    fixture.detectChanges();
    return [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[data-tour="flow-alert"]')];
  }

  it('says what a known error means first, with the Address and the raw error behind Technical details', () => {
    const [alert] = show('2026-10-24 10:12:03 +0200 : Failed to start [file://in?noop=true]: Multiple consumers for the same endpoint');

    const meaning = alert.querySelector('.flow-alerts-drawer__meaning')!;
    const details = alert.querySelector<HTMLDetailsElement>('details')!;
    expect(meaning.textContent).toContain('Another running Flow already reads from this endpoint');
    expect(meaning.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(details.querySelector('summary')!.textContent).toBe('Technical details');
    expect(details.open).toBe(false);
    expect([...details.querySelectorAll('dt')].map(term => term.textContent)).toEqual(['Address', 'Error']);
    expect(details.querySelector('.flow-alerts-drawer__message')!.textContent).toBe('Multiple consumers for the same endpoint');
  });

  it('shows the raw error at once when there is no explanation', () => {
    const [alert] = show('2026-03-06 09:53:13 +0100 : Something nobody explained');

    expect(alert.querySelector('.flow-alerts-drawer__meaning')).toBeNull();
    expect(alert.querySelector<HTMLDetailsElement>('details')!.open).toBe(true);
  });
});
