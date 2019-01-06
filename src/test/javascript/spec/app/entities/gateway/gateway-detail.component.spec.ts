/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { GatewayDetailComponent } from 'app/entities/gateway/gateway-detail.component';
import { Gateway } from 'app/shared/model/gateway.model';

describe('Component Tests', () => {
    describe('Gateway Management Detail Component', () => {
        let comp: GatewayDetailComponent;
        let fixture: ComponentFixture<GatewayDetailComponent>;
        const route = ({ data: of({ gateway: new Gateway(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [GatewayDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(GatewayDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(GatewayDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.gateway).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
