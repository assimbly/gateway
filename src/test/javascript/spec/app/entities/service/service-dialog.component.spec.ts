/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { ServiceDialogComponent } from '../../../../../../main/webapp/app/entities/service/service-dialog.component';
import { ServiceService } from '../../../../../../main/webapp/app/entities/service/service.service';
import { Service } from '../../../../../../main/webapp/app/entities/service/service.model';

describe('Component Tests', () => {

    describe('Service Management Dialog Component', () => {
        let comp: ServiceDialogComponent;
        let fixture: ComponentFixture<ServiceDialogComponent>;
        let service: ServiceService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ServiceDialogComponent],
                providers: [
                    ServiceService
                ]
            })
            .overrideTemplate(ServiceDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ServiceDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ServiceService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Service(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.service = entity;
                        // WHEN
                        comp.save(true);
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'serviceListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Service();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.service = entity;
                        // WHEN
                        comp.save(true);
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'serviceListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
