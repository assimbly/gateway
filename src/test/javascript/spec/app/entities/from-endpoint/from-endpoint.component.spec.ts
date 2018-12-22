/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { FromEndpointComponent } from 'app/entities/from-endpoint/from-endpoint.component';
import { FromEndpointService } from 'app/entities/from-endpoint/from-endpoint.service';
import { FromEndpoint } from 'app/shared/model/from-endpoint.model';

describe('Component Tests', () => {
    describe('FromEndpoint Management Component', () => {
        let comp: FromEndpointComponent;
        let fixture: ComponentFixture<FromEndpointComponent>;
        let service: FromEndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FromEndpointComponent],
                providers: []
            })
                .overrideTemplate(FromEndpointComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(FromEndpointComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FromEndpointService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new FromEndpoint(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.fromEndpoints[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
