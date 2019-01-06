/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { FlowDetailComponent } from 'app/entities/flow/flow-detail.component';
import { Flow } from 'app/shared/model/flow.model';

describe('Component Tests', () => {
    describe('Flow Management Detail Component', () => {
        let comp: FlowDetailComponent;
        let fixture: ComponentFixture<FlowDetailComponent>;
        const route = ({ data: of({ flow: new Flow(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FlowDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(FlowDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(FlowDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.flow).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
