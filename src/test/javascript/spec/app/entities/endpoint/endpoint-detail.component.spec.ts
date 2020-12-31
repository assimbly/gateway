/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { EndpointDetailComponent } from 'app/entities/endpoint/endpoint-detail.component';
import { Endpoint } from 'app/shared/model/endpoint.model';

describe('Component Tests', () => {
    describe('Endpoint Management Detail Component', () => {
        let comp: EndpointDetailComponent;
        let fixture: ComponentFixture<EndpointDetailComponent>;
        const route = ({ data: of({ endpoint: new Endpoint(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EndpointDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(EndpointDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(EndpointDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.endpoint).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
