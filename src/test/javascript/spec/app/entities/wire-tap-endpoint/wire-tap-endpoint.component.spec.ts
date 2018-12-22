/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { WireTapEndpointComponent } from 'app/entities/wire-tap-endpoint/wire-tap-endpoint.component';
import { WireTapEndpointService } from 'app/entities/wire-tap-endpoint/wire-tap-endpoint.service';
import { WireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';

describe('Component Tests', () => {
    describe('WireTapEndpoint Management Component', () => {
        let comp: WireTapEndpointComponent;
        let fixture: ComponentFixture<WireTapEndpointComponent>;
        let service: WireTapEndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [WireTapEndpointComponent],
                providers: []
            })
                .overrideTemplate(WireTapEndpointComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(WireTapEndpointComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(WireTapEndpointService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new WireTapEndpoint(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.wireTapEndpoints[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
