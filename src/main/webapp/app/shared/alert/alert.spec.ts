import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertModel, AlertService } from 'app/core/util';

import { Alert } from './alert';

describe('Alert Component', () => {
  let comp: Alert;
  let fixture: ComponentFixture<Alert>;
  let mockAlertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AlertService,
          useValue: {
            alerts: signal([]),
            clear: jest.fn(),
          },
        },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Alert);
    comp = fixture.componentInstance;
    mockAlertService = TestBed.inject(AlertService);
  });

  // The alerts are read from the component, not from the page: the test setup has no $localize for a rendered ngb-alert.
  it('should show alerts added after init', () => {
    const alerts = mockAlertService.alerts as WritableSignal<AlertModel[]>;
    alerts.set([{ id: 0, type: 'success', message: 'Hello' }]);

    expect(comp.alerts()).toHaveLength(1);
  });

  it('shows errors too, unless it is told to leave them out as the app-wide outlet is', () => {
    const alerts = mockAlertService.alerts as WritableSignal<AlertModel[]>;
    alerts.set([
      { id: 0, type: 'success', message: 'Imported Flow Orders' },
      { id: 1, type: 'warning', message: 'A Step was skipped' },
      { id: 2, type: 'danger', message: 'Http failure response' },
    ]);
    expect(comp.alerts()).toHaveLength(3);

    fixture.componentRef.setInput('withoutErrors', true);

    expect(comp.alerts().map(alert => alert.message)).toEqual(['Imported Flow Orders', 'A Step was skipped']);
  });

  it('should call alertService.clear on destroy', () => {
    // WHEN
    comp.ngOnDestroy();

    // THEN
    expect(mockAlertService.clear).toHaveBeenCalled();
  });
});
