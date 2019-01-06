/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { FromEndpointDetailComponent } from 'app/entities/from-endpoint/from-endpoint-detail.component';
import { FromEndpoint } from 'app/shared/model/from-endpoint.model';

describe('Component Tests', () => {
    describe('FromEndpoint Management Detail Component', () => {
        let comp: FromEndpointDetailComponent;
        let fixture: ComponentFixture<FromEndpointDetailComponent>;
        const route = ({ data: of({ fromEndpoint: new FromEndpoint(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FromEndpointDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(FromEndpointDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(FromEndpointDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.fromEndpoint).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
