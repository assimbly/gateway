/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { WireTapEndpointDetailComponent } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint-detail.component';
import { WireTapEndpointService } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint.service';
import { WireTapEndpoint } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint.model';

describe('Component Tests', () => {

    describe('WireTapEndpoint Management Detail Component', () => {
        let comp: WireTapEndpointDetailComponent;
        let fixture: ComponentFixture<WireTapEndpointDetailComponent>;
        let service: WireTapEndpointService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [WireTapEndpointDetailComponent],
                providers: [
                    WireTapEndpointService
                ]
            })
            .overrideTemplate(WireTapEndpointDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(WireTapEndpointDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(WireTapEndpointService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new WireTapEndpoint(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.wireTapEndpoint).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
