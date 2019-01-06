/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ErrorEndpointDetailComponent } from 'app/entities/error-endpoint/error-endpoint-detail.component';
import { ErrorEndpoint } from 'app/shared/model/error-endpoint.model';

describe('Component Tests', () => {
    describe('ErrorEndpoint Management Detail Component', () => {
        let comp: ErrorEndpointDetailComponent;
        let fixture: ComponentFixture<ErrorEndpointDetailComponent>;
        const route = ({ data: of({ errorEndpoint: new ErrorEndpoint(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ErrorEndpointDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(ErrorEndpointDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(ErrorEndpointDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.errorEndpoint).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
