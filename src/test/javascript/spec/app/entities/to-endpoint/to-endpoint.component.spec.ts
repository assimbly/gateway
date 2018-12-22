/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { ToEndpointComponent } from 'app/entities/to-endpoint/to-endpoint.component';
import { ToEndpointService } from 'app/entities/to-endpoint/to-endpoint.service';
import { ToEndpoint } from 'app/shared/model/to-endpoint.model';

describe('Component Tests', () => {
    describe('ToEndpoint Management Component', () => {
        let comp: ToEndpointComponent;
        let fixture: ComponentFixture<ToEndpointComponent>;
        let service: ToEndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ToEndpointComponent],
                providers: []
            })
                .overrideTemplate(ToEndpointComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ToEndpointComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ToEndpointService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new ToEndpoint(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.toEndpoints[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
