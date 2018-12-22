/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { ServiceKeysDialogComponent } from '../../../../../../main/webapp/app/entities/service-keys/service-keys-dialog.component';
import { ServiceKeysService } from '../../../../../../main/webapp/app/entities/service-keys/service-keys.service';
import { ServiceKeys } from '../../../../../../main/webapp/app/entities/service-keys/service-keys.model';
import { ServiceService } from '../../../../../../main/webapp/app/entities/service';

describe('Component Tests', () => {

    describe('ServiceKeys Management Dialog Component', () => {
        let comp: ServiceKeysDialogComponent;
        let fixture: ComponentFixture<ServiceKeysDialogComponent>;
        let service: ServiceKeysService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ServiceKeysDialogComponent],
                providers: [
                    ServiceService,
                    ServiceKeysService
                ]
            })
            .overrideTemplate(ServiceKeysDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ServiceKeysDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ServiceKeysService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new ServiceKeys(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.serviceKeys = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'serviceKeysListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new ServiceKeys();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.serviceKeys = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'serviceKeysListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
