/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { GatewayDialogComponent } from '../../../../../../main/webapp/app/entities/gateway/gateway-dialog.component';
import { GatewayService } from '../../../../../../main/webapp/app/entities/gateway/gateway.service';
import { Gateway } from '../../../../../../main/webapp/app/entities/gateway/gateway.model';

describe('Component Tests', () => {

    describe('Gateway Management Dialog Component', () => {
        let comp: GatewayDialogComponent;
        let fixture: ComponentFixture<GatewayDialogComponent>;
        let service: GatewayService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [GatewayDialogComponent],
                providers: [
                    GatewayService
                ]
            })
            .overrideTemplate(GatewayDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(GatewayDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(GatewayService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Gateway(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.gateway = entity;
                        // WHEN
                        comp.save(true);
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'gatewayListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Gateway();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.gateway = entity;
                        // WHEN
                        comp.save(true);
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'gatewayListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
