/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { WireTapEndpointComponent } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint.component';
import { WireTapEndpointService } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint.service';
import { WireTapEndpoint } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint.model';

describe('Component Tests', () => {

    describe('WireTapEndpoint Management Component', () => {
        let comp: WireTapEndpointComponent;
        let fixture: ComponentFixture<WireTapEndpointComponent>;
        let service: WireTapEndpointService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [WireTapEndpointComponent],
                providers: [
                    WireTapEndpointService
                ]
            })
            .overrideTemplate(WireTapEndpointComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(WireTapEndpointComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(WireTapEndpointService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new WireTapEndpoint(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.wireTapEndpoints[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
