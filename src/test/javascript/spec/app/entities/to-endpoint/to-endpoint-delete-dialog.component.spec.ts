/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { ToEndpointDeleteDialogComponent } from 'app/entities/to-endpoint/to-endpoint-delete-dialog.component';
import { ToEndpointService } from 'app/entities/to-endpoint/to-endpoint.service';

describe('Component Tests', () => {
    describe('ToEndpoint Management Delete Component', () => {
        let comp: ToEndpointDeleteDialogComponent;
        let fixture: ComponentFixture<ToEndpointDeleteDialogComponent>;
        let service: ToEndpointService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ToEndpointDeleteDialogComponent]
            })
                .overrideTemplate(ToEndpointDeleteDialogComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(ToEndpointDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ToEndpointService);
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
