/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { MaintenanceComponent } from '../../../../../../main/webapp/app/entities/maintenance/maintenance.component';
import { MaintenanceService } from '../../../../../../main/webapp/app/entities/maintenance/maintenance.service';
import { Maintenance } from '../../../../../../main/webapp/app/entities/maintenance/maintenance.model';

describe('Component Tests', () => {

    describe('Maintenance Management Component', () => {
        let comp: MaintenanceComponent;
        let fixture: ComponentFixture<MaintenanceComponent>;
        let service: MaintenanceService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [MaintenanceComponent],
                providers: [
                    MaintenanceService
                ]
            })
            .overrideTemplate(MaintenanceComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(MaintenanceComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(MaintenanceService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new Maintenance(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.maintenances[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
