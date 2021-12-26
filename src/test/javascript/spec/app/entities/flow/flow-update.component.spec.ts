/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { FlowUpdateComponent } from 'app/entities/flow/flow-update.component';
import { FlowService } from 'app/entities/flow/flow.service';
import { Flow } from 'app/shared/model/flow.model';

describe('Component Tests', () => {
    describe('Flow Management Update Component', () => {
        let comp: FlowUpdateComponent;
        let fixture: ComponentFixture<FlowUpdateComponent>;
        let service: FlowService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FlowUpdateComponent]
            })
                .overrideTemplate(FlowUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(FlowUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FlowService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new Flow(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.flow = entity;
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
                    const entity = new Flow();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.flow = entity;
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