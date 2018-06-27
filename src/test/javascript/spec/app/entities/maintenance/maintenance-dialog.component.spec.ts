/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { MaintenanceDialogComponent } from '../../../../../../main/webapp/app/entities/maintenance/maintenance-dialog.component';
import { MaintenanceService } from '../../../../../../main/webapp/app/entities/maintenance/maintenance.service';
import { Maintenance } from '../../../../../../main/webapp/app/entities/maintenance/maintenance.model';
import { FlowService } from '../../../../../../main/webapp/app/entities/flow';

describe('Component Tests', () => {

    describe('Maintenance Management Dialog Component', () => {
        let comp: MaintenanceDialogComponent;
        let fixture: ComponentFixture<MaintenanceDialogComponent>;
        let service: MaintenanceService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [MaintenanceDialogComponent],
                providers: [
                    FlowService,
                    MaintenanceService
                ]
            })
            .overrideTemplate(MaintenanceDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(MaintenanceDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(MaintenanceService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Maintenance(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.maintenance = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'maintenanceListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Maintenance();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.maintenance = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'maintenanceListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
