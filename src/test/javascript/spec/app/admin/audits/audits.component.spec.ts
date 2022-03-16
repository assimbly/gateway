import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { advanceTo } from 'jest-date-mock';

import { GatewayTestModule } from '../../../test.module';
import { AuditsComponent } from 'app/admin/audits/audits.component';
import { AuditsService } from 'app/admin/audits/audits.service';
import { Audit } from 'app/admin/audits/audit.model';
import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { MockRouter, MockActivatedRoute } from '../../../helpers/mock-route.service';

function build2DigitsDatePart(datePart: number): string {
  return `0${datePart}`.slice(-2);
}

function getDate(isToday = true): string {
  let date: Date = new Date();
  if (isToday) {
    // Today + 1 day - needed if the current day must be included
    date.setDate(date.getDate() + 1);
  } else {
    // get last month
    if (date.getMonth() === 0) {
      date = new Date(date.getFullYear() - 1, 11, date.getDate());
    } else {
      date = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
    }
  }
  const monthString = build2DigitsDatePart(date.getMonth() + 1);
  const dateString = build2DigitsDatePart(date.getDate());
  return `${date.getFullYear()}-${monthString}-${dateString}`;
}

describe('Component Tests', () => {
  describe('AuditsComponent', () => {
    let comp: AuditsComponent;
    let fixture: ComponentFixture<AuditsComponent>;
    let service: AuditsService;
    let mockRouter: MockRouter;
    let mockActivatedRoute: MockActivatedRoute;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [GatewayTestModule],
        declarations: [AuditsComponent],
        providers: [AuditsService],
      })
        .overrideTemplate(AuditsComponent, '')
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(AuditsComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(AuditsService);
      mockRouter = TestBed.get(Router);
      mockActivatedRoute = TestBed.get(ActivatedRoute);
    });

    describe('today function', () => {
      it('should set toDate to current date', () => {
        comp.ngOnInit();
        expect(comp.toDate).toBe(getDate());
      });

      it('if current day is last day of month then should set toDate to first day of next month', () => {
        advanceTo(new Date(2019, 0, 31, 0, 0, 0));
        comp.ngOnInit();
        expect(comp.toDate).toBe('2019-02-01');
      });

      it('if current day is not last day of month then should set toDate to next day of current month', () => {
        advanceTo(new Date(2019, 0, 27, 0, 0, 0));
        comp.ngOnInit();
        expect(comp.toDate).toBe('2019-01-28');
      });
    });

    describe('previousMonth function', () => {
      it('should set fromDate to previous month', () => {
        comp.ngOnInit();
        expect(comp.fromDate).toBe(getDate(false));
      });

      it('if current month is January then should set fromDate to previous year last month', () => {
        advanceTo(new Date(2019, 0, 20, 0, 0, 0));
        comp.ngOnInit();
        expect(comp.fromDate).toBe('2018-12-20');
      });

      it('if current month is not January then should set fromDate to current year previous month', () => {
        advanceTo(new Date(2019, 1, 20, 0, 0, 0));
        comp.ngOnInit();
        expect(comp.fromDate).toBe('2019-01-20');
      });
    });

    describe('By default, on init', () => {
      it('should set all default values correctly', () => {
        fixture.detectChanges();
        expect(comp.toDate).toBe(getDate());
        expect(comp.fromDate).toBe(getDate(false));
        expect(comp.itemsPerPage).toBe(ITEMS_PER_PAGE);
        expect(comp.page).toBe(1);
        expect(comp.ascending).toBe(false);
        expect(comp.predicate).toBe('id');
      });
    });

    describe('OnInit', () => {
      it('Should call load all on init', () => {
        // GIVEN
        const headers = new HttpHeaders().append('X-Total-Count', '1');
        const audit = new Audit({ remoteAddress: '127.0.0.1', sessionId: '123' }, 'user', '20140101', 'AUTHENTICATION_SUCCESS');
        spyOn(service, 'query').and.returnValue(
          of(
            new HttpResponse({
              body: [audit],
              headers,
            })
          )
        );

        // WHEN
        comp.ngOnInit();

        // THEN
        expect(service.query).toHaveBeenCalledTimes(1);
        expect(comp.audits && comp.audits[0]).toEqual(jasmine.objectContaining(audit));
        expect(comp.totalItems).toBe(1);
      });
    });

    describe('Create sort object', () => {
      beforeEach(() => {
        spyOn(service, 'query').and.returnValue(of(new HttpResponse({ body: null })));
      });

      it('Should sort only by id asc', () => {
        // GIVEN
        mockActivatedRoute.setParameters({
          sort: 'id,desc',
        });

        // WHEN
        comp.ngOnInit();

        // THEN
        expect(service.query).toBeCalledWith(
          expect.objectContaining({
            sort: ['id,desc'],
          })
        );
      });

      it('Should sort by timestamp asc then by id', () => {
        // GIVEN
        mockActivatedRoute.setParameters({
          sort: 'timestamp,asc',
        });

        // WHEN
        comp.ngOnInit();

        // THEN
        expect(service.query).toBeCalledWith(
          expect.objectContaining({
            sort: ['timestamp,asc', 'id'],
          })
        );
      });
    });

    describe('transition', () => {
      it('Should not query data if fromDate and toDate are empty', () => {
        // GIVEN
        comp.toDate = '';
        comp.fromDate = '';

        // WHEN
        comp.transition();

        // THEN
        expect(comp.canLoad()).toBe(false);
        expect(mockRouter.navigateSpy).not.toBeCalled();
      });

      it('Should query data if fromDate and toDate are not empty', () => {
        // GIVEN
        comp.toDate = getDate();
        comp.fromDate = getDate(false);

        // WHEN
        comp.transition();

        // THEN
        expect(comp.canLoad()).toBe(true);
        expect(mockRouter.navigateSpy).toBeCalled();
      });
    });
  });
});
