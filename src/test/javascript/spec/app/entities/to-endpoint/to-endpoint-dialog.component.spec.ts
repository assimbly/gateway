/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { ToEndpointDialogComponent } from '../../../../../../main/webapp/app/entities/to-endpoint/to-endpoint-dialog.component';
import { ToEndpointService } from '../../../../../../main/webapp/app/entities/to-endpoint/to-endpoint.service';
import { ToEndpoint } from '../../../../../../main/webapp/app/entities/to-endpoint/to-endpoint.model';
import { FlowService } from '../../../../../../main/webapp/app/entities/flow';
import { ServiceService } from '../../../../../../main/webapp/app/entities/service';
import { HeaderService } from '../../../../../../main/webapp/app/entities/header';

describe('Component Tests', () => {

    describe('ToEndpoint Management Dialog Component', () => {
        let comp: ToEndpointDialogComponent;
        let fixture: ComponentFixture<ToEndpointDialogComponent>;
        let service: ToEndpointService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ToEndpointDialogComponent],
                providers: [
                    FlowService,
                    ServiceService,
                    HeaderService,
                    ToEndpointService
                ]
            })
            .overrideTemplate(ToEndpointDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ToEndpointDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ToEndpointService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new ToEndpoint(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.toEndpoint = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'toEndpointListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new ToEndpoint();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.toEndpoint = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'toEndpointListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
