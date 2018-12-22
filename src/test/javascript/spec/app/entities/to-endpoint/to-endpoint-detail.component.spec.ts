/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ToEndpointDetailComponent } from 'app/entities/to-endpoint/to-endpoint-detail.component';
import { ToEndpoint } from 'app/shared/model/to-endpoint.model';

describe('Component Tests', () => {
    describe('ToEndpoint Management Detail Component', () => {
        let comp: ToEndpointDetailComponent;
        let fixture: ComponentFixture<ToEndpointDetailComponent>;
        const route = ({ data: of({ toEndpoint: new ToEndpoint(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ToEndpointDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(ToEndpointDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(ToEndpointDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.toEndpoint).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
