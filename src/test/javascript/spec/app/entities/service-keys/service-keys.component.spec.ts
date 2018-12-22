/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { ServiceKeysComponent } from 'app/entities/service-keys/service-keys.component';
import { ServiceKeysService } from 'app/entities/service-keys/service-keys.service';
import { ServiceKeys } from 'app/shared/model/service-keys.model';

describe('Component Tests', () => {
    describe('ServiceKeys Management Component', () => {
        let comp: ServiceKeysComponent;
        let fixture: ComponentFixture<ServiceKeysComponent>;
        let service: ServiceKeysService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ServiceKeysComponent],
                providers: []
            })
                .overrideTemplate(ServiceKeysComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ServiceKeysComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ServiceKeysService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new ServiceKeys(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.serviceKeys[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
