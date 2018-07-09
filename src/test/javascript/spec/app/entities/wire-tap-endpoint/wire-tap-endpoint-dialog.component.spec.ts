/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { WireTapEndpointDialogComponent } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint-dialog.component';
import { WireTapEndpointService } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint.service';
import { WireTapEndpoint } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint.model';
import { ServiceService } from '../../../../../../main/webapp/app/entities/service';
import { HeaderService } from '../../../../../../main/webapp/app/entities/header';

describe('Component Tests', () => {

    describe('WireTapEndpoint Management Dialog Component', () => {
        let comp: WireTapEndpointDialogComponent;
        let fixture: ComponentFixture<WireTapEndpointDialogComponent>;
        let service: WireTapEndpointService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [WireTapEndpointDialogComponent],
                providers: [
                    ServiceService,
                    HeaderService,
                    WireTapEndpointService
                ]
            })
            .overrideTemplate(WireTapEndpointDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(WireTapEndpointDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(WireTapEndpointService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new WireTapEndpoint(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.wireTapEndpoint = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'wireTapEndpointListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new WireTapEndpoint();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.wireTapEndpoint = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'wireTapEndpointListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
