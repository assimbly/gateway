/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { EnvironmentVariablesDialogComponent } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables-dialog.component';
import { EnvironmentVariablesService } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables.service';
import { EnvironmentVariables } from '../../../../../../main/webapp/app/shared/model/environment-variables.model';
import { GatewayService } from '../../../../../../main/webapp/app/entities/gateway';

describe('Component Tests', () => {

    describe('EnvironmentVariables Management Dialog Component', () => {
        let comp: EnvironmentVariablesDialogComponent;
        let fixture: ComponentFixture<EnvironmentVariablesDialogComponent>;
        let service: EnvironmentVariablesService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EnvironmentVariablesDialogComponent],
                providers: [
                    GatewayService,
                    EnvironmentVariablesService
                ]
            })
            .overrideTemplate(EnvironmentVariablesDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(EnvironmentVariablesDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(EnvironmentVariablesService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new EnvironmentVariables(123);
                        spyOn(service, 'update').and.returnValue(of(entity));
                        comp.environmentVariables = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'environmentVariablesListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new EnvironmentVariables();
                        spyOn(service, 'create').and.returnValue(of(entity));
                        comp.environmentVariables = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'environmentVariablesListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
