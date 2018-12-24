/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { MaintenanceComponent } from 'app/entities/maintenance/maintenance.component';
import { MaintenanceService } from 'app/entities/maintenance/maintenance.service';
import { Maintenance } from 'app/shared/model/maintenance.model';

describe('Component Tests', () => {
    describe('Maintenance Management Component', () => {
        let comp: MaintenanceComponent;
        let fixture: ComponentFixture<MaintenanceComponent>;
        let service: MaintenanceService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [MaintenanceComponent],
                providers: []
            })
                .overrideTemplate(MaintenanceComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(MaintenanceComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(MaintenanceService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(of({
                    json: [new Maintenance(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                //expect(comp.maintenances[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new Maintenance(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled()});
        });
    });
});
