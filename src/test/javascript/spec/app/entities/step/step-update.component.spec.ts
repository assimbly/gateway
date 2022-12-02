/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { StepUpdateComponent } from 'app/entities/step/step-update.component';
import { StepService } from 'app/entities/step/step.service';
import { Step } from 'app/shared/model/step.model';

describe('Component Tests', () => {
    describe('Step Management Update Component', () => {
        let comp: StepUpdateComponent;
        let fixture: ComponentFixture<StepUpdateComponent>;
        let service: StepService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [StepUpdateComponent]
            })
                .overrideTemplate(StepUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(StepUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(StepService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new Step(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.step = entity;
                    // WHEN
                    comp.save();
                    tick(); // simulate async

                    // THEN
                    expect(service.update).toHaveBeenCalledWith(entity);
                    expect(comp.isSaving).toEqual(false);
                })
            );

            it(
                'Should call create service on save for new entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new Step();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.step = entity;
                    // WHEN
                    comp.save();
                    tick(); // simulate async

                    // THEN
                    expect(service.create).toHaveBeenCalledWith(entity);
                    expect(comp.isSaving).toEqual(false);
                })
            );
        });
    });
});
