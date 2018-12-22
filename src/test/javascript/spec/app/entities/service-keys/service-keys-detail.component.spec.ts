/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { ServiceKeysDetailComponent } from '../../../../../../main/webapp/app/entities/service-keys/service-keys-detail.component';
import { ServiceKeysService } from '../../../../../../main/webapp/app/entities/service-keys/service-keys.service';
import { ServiceKeys } from '../../../../../../main/webapp/app/entities/service-keys/service-keys.model';

describe('Component Tests', () => {

    describe('ServiceKeys Management Detail Component', () => {
        let comp: ServiceKeysDetailComponent;
        let fixture: ComponentFixture<ServiceKeysDetailComponent>;
        let service: ServiceKeysService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ServiceKeysDetailComponent],
                providers: [
                    ServiceKeysService
                ]
            })
            .overrideTemplate(ServiceKeysDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ServiceKeysDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ServiceKeysService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new ServiceKeys(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.serviceKeys).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
