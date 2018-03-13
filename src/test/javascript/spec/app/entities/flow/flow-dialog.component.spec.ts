/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { FlowDialogComponent } from '../../../../../../main/webapp/app/entities/flow/flow-dialog.component';
import { FlowService } from '../../../../../../main/webapp/app/entities/flow/flow.service';
import { Flow } from '../../../../../../main/webapp/app/entities/flow/flow.model';
import { GatewayService } from '../../../../../../main/webapp/app/entities/gateway';
import { FromEndpointService } from '../../../../../../main/webapp/app/entities/from-endpoint';
import { ErrorEndpointService } from '../../../../../../main/webapp/app/entities/error-endpoint';

describe('Component Tests', () => {

    describe('Flow Management Dialog Component', () => {
        let comp: FlowDialogComponent;
        let fixture: ComponentFixture<FlowDialogComponent>;
        let service: FlowService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FlowDialogComponent],
                providers: [
                    GatewayService,
                    FromEndpointService,
                    ErrorEndpointService,
                    FlowService
                ]
            })
            .overrideTemplate(FlowDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(FlowDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FlowService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Flow(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.flow = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'flowListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Flow();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.flow = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'flowListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
