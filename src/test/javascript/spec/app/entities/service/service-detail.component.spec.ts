/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { ServiceDetailComponent } from '../../../../../../main/webapp/app/entities/service/service-detail.component';
import { ServiceService } from '../../../../../../main/webapp/app/entities/service/service.service';
import { Service } from '../../../../../../main/webapp/app/entities/service/service.model';

describe('Component Tests', () => {

    describe('Service Management Detail Component', () => {
        let comp: ServiceDetailComponent;
        let fixture: ComponentFixture<ServiceDetailComponent>;
        let service: ServiceService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ServiceDetailComponent],
                providers: [
                    ServiceService
                ]
            })
            .overrideTemplate(ServiceDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ServiceDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ServiceService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new Service(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.service).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
