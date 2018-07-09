/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { WireTapEndpointDeleteDialogComponent } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint-delete-dialog.component';
import { WireTapEndpointService } from '../../../../../../main/webapp/app/entities/wire-tap-endpoint/wire-tap-endpoint.service';

describe('Component Tests', () => {

    describe('WireTapEndpoint Management Delete Component', () => {
        let comp: WireTapEndpointDeleteDialogComponent;
        let fixture: ComponentFixture<WireTapEndpointDeleteDialogComponent>;
        let service: WireTapEndpointService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [WireTapEndpointDeleteDialogComponent],
                providers: [
                    WireTapEndpointService
                ]
            })
            .overrideTemplate(WireTapEndpointDeleteDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(WireTapEndpointDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(WireTapEndpointService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('confirmDelete', () => {
            it('Should call delete service on confirmDelete',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        spyOn(service, 'delete').and.returnValue(Observable.of({}));

                        // WHEN
                        comp.confirmDelete(123);
                        tick();

                        // THEN
                        expect(service.delete).toHaveBeenCalledWith(123);
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
