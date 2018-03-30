/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { ServiceKeysComponent } from '../../../../../../main/webapp/app/entities/service-keys/service-keys.component';
import { ServiceKeysService } from '../../../../../../main/webapp/app/entities/service-keys/service-keys.service';
import { ServiceKeys } from '../../../../../../main/webapp/app/entities/service-keys/service-keys.model';

describe('Component Tests', () => {

    describe('ServiceKeys Management Component', () => {
        let comp: ServiceKeysComponent;
        let fixture: ComponentFixture<ServiceKeysComponent>;
        let service: ServiceKeysService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ServiceKeysComponent],
                providers: [
                    ServiceKeysService
                ]
            })
            .overrideTemplate(ServiceKeysComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ServiceKeysComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ServiceKeysService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new ServiceKeys(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.serviceKeys[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
