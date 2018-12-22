/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { ErrorEndpointComponent } from 'app/entities/error-endpoint/error-endpoint.component';
import { ErrorEndpointService } from 'app/entities/error-endpoint/error-endpoint.service';
import { ErrorEndpoint } from 'app/shared/model/error-endpoint.model';

describe('Component Tests', () => {
    describe('ErrorEndpoint Management Component', () => {
        let comp: ErrorEndpointComponent;
        let fixture: ComponentFixture<ErrorEndpointComponent>;
        let service: ErrorEndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ErrorEndpointComponent],
                providers: []
            })
                .overrideTemplate(ErrorEndpointComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ErrorEndpointComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ErrorEndpointService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new ErrorEndpoint(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.errorEndpoints[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
