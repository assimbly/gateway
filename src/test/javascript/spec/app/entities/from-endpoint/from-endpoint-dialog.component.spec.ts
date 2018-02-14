/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { FromEndpointDialogComponent } from '../../../../../../main/webapp/app/entities/from-endpoint/from-endpoint-dialog.component';
import { FromEndpointService } from '../../../../../../main/webapp/app/entities/from-endpoint/from-endpoint.service';
import { FromEndpoint } from '../../../../../../main/webapp/app/entities/from-endpoint/from-endpoint.model';
import { ServiceService } from '../../../../../../main/webapp/app/entities/service';
import { HeaderService } from '../../../../../../main/webapp/app/entities/header';

describe('Component Tests', () => {

    describe('FromEndpoint Management Dialog Component', () => {
        let comp: FromEndpointDialogComponent;
        let fixture: ComponentFixture<FromEndpointDialogComponent>;
        let service: FromEndpointService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FromEndpointDialogComponent],
                providers: [
                    ServiceService,
                    HeaderService,
                    FromEndpointService
                ]
            })
            .overrideTemplate(FromEndpointDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(FromEndpointDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FromEndpointService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new FromEndpoint(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.fromEndpoint = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'fromEndpointListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new FromEndpoint();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.fromEndpoint = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'fromEndpointListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
