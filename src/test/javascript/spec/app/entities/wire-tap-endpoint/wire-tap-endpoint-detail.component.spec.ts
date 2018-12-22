/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { WireTapEndpointDetailComponent } from 'app/entities/wire-tap-endpoint/wire-tap-endpoint-detail.component';
import { WireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';

describe('Component Tests', () => {
    describe('WireTapEndpoint Management Detail Component', () => {
        let comp: WireTapEndpointDetailComponent;
        let fixture: ComponentFixture<WireTapEndpointDetailComponent>;
        const route = ({ data: of({ wireTapEndpoint: new WireTapEndpoint(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [WireTapEndpointDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(WireTapEndpointDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(WireTapEndpointDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.wireTapEndpoint).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
