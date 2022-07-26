/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { StepDetailComponent } from 'app/entities/step/step-detail.component';
import { Step } from 'app/shared/model/step.model';

describe('Component Tests', () => {
    describe('Step Management Detail Component', () => {
        let comp: StepDetailComponent;
        let fixture: ComponentFixture<StepDetailComponent>;
        const route = ({ data: of({ step: new Step(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [StepDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(StepDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(StepDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.step).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
