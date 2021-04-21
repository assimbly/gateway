import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { QueueUpdateComponent } from 'app/entities/queue/queue-update.component';
import { QueueService } from 'app/entities/queue/queue.service';
import { Queue } from 'app/shared/model/queue.model';

describe('Component Tests', () => {
    describe('Queue Management Update Component', () => {
        let comp: QueueUpdateComponent;
        let fixture: ComponentFixture<QueueUpdateComponent>;
        let service: QueueService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [QueueUpdateComponent],
                providers: [FormBuilder]
            })
                .overrideTemplate(QueueUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(QueueUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(QueueService);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity', fakeAsync(() => {
                // GIVEN
                const entity = new Queue(123);
                spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                comp.updateForm(entity);
                // WHEN
                comp.save();
                tick(); // simulate async

                // THEN
                expect(service.update).toHaveBeenCalledWith(entity);
                expect(comp.isSaving).toEqual(false);
            }));

            it('Should call create service on save for new entity', fakeAsync(() => {
                // GIVEN
                const entity = new Queue();
                spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                comp.updateForm(entity);
                // WHEN
                comp.save();
                tick(); // simulate async

                // THEN
                expect(service.create).toHaveBeenCalledWith(entity);
                expect(comp.isSaving).toEqual(false);
            }));
        });
    });
});
