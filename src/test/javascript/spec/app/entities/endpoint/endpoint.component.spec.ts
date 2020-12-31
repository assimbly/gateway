/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { EndpointComponent } from 'app/entities/endpoint/endpoint.component';
import { EndpointService } from 'app/entities/endpoint/endpoint.service';
import { Endpoint } from 'app/shared/model/endpoint.model';

describe('Component Tests', () => {
    describe('Endpoint Management Component', () => {
        let comp: EndpointComponent;
        let fixture: ComponentFixture<EndpointComponent>;
        let service: EndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EndpointComponent],
                providers: []
            })
                .overrideTemplate(EndpointComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(EndpointComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(EndpointService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new Endpoint(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.endpoints[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
