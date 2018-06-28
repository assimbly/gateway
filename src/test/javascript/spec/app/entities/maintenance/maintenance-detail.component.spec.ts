/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { MaintenanceDetailComponent } from '../../../../../../main/webapp/app/entities/maintenance/maintenance-detail.component';
import { MaintenanceService } from '../../../../../../main/webapp/app/entities/maintenance/maintenance.service';
import { Maintenance } from '../../../../../../main/webapp/app/entities/maintenance/maintenance.model';

describe('Component Tests', () => {

    describe('Maintenance Management Detail Component', () => {
        let comp: MaintenanceDetailComponent;
        let fixture: ComponentFixture<MaintenanceDetailComponent>;
        let service: MaintenanceService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [MaintenanceDetailComponent],
                providers: [
                    MaintenanceService
                ]
            })
            .overrideTemplate(MaintenanceDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(MaintenanceDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(MaintenanceService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new Maintenance(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.maintenance).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
