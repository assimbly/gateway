/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { WireTapEndpointDeleteDialogComponent } from 'app/entities/wire-tap-endpoint/wire-tap-endpoint-delete-dialog.component';
import { WireTapEndpointService } from 'app/entities/wire-tap-endpoint/wire-tap-endpoint.service';

describe('Component Tests', () => {
    describe('WireTapEndpoint Management Delete Component', () => {
        let comp: WireTapEndpointDeleteDialogComponent;
        let fixture: ComponentFixture<WireTapEndpointDeleteDialogComponent>;
        let service: WireTapEndpointService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [WireTapEndpointDeleteDialogComponent]
            })
                .overrideTemplate(WireTapEndpointDeleteDialogComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(WireTapEndpointDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(WireTapEndpointService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('confirmDelete', () => {
            it('Should call delete service on confirmDelete', inject(
                [],
                fakeAsync(() => {
                    // GIVEN
                    spyOn(service, 'delete').and.returnValue(of({}));

                    // WHEN
                    comp.confirmDelete(123);
                    tick();

                    // THEN
                    expect(service.delete).toHaveBeenCalledWith(123);
                    expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    expect(mockEventManager.broadcastSpy).toHaveBeenCalled();
                })
            ));
        });
    });
});
