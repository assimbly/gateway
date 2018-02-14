/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { ErrorEndpointDialogComponent } from '../../../../../../main/webapp/app/entities/error-endpoint/error-endpoint-dialog.component';
import { ErrorEndpointService } from '../../../../../../main/webapp/app/entities/error-endpoint/error-endpoint.service';
import { ErrorEndpoint } from '../../../../../../main/webapp/app/entities/error-endpoint/error-endpoint.model';
import { ServiceService } from '../../../../../../main/webapp/app/entities/service';
import { HeaderService } from '../../../../../../main/webapp/app/entities/header';

describe('Component Tests', () => {

    describe('ErrorEndpoint Management Dialog Component', () => {
        let comp: ErrorEndpointDialogComponent;
        let fixture: ComponentFixture<ErrorEndpointDialogComponent>;
        let service: ErrorEndpointService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ErrorEndpointDialogComponent],
                providers: [
                    ServiceService,
                    HeaderService,
                    ErrorEndpointService
                ]
            })
            .overrideTemplate(ErrorEndpointDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ErrorEndpointDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ErrorEndpointService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new ErrorEndpoint(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.errorEndpoint = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'errorEndpointListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new ErrorEndpoint();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.errorEndpoint = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'errorEndpointListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
