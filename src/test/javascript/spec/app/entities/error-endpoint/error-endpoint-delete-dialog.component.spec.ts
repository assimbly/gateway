/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { ErrorEndpointDeleteDialogComponent } from 'app/entities/error-endpoint/error-endpoint-delete-dialog.component';
import { ErrorEndpointService } from 'app/entities/error-endpoint/error-endpoint.service';

describe('Component Tests', () => {
    describe('ErrorEndpoint Management Delete Component', () => {
        let comp: ErrorEndpointDeleteDialogComponent;
        let fixture: ComponentFixture<ErrorEndpointDeleteDialogComponent>;
        let service: ErrorEndpointService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ErrorEndpointDeleteDialogComponent]
            })
                .overrideTemplate(ErrorEndpointDeleteDialogComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(ErrorEndpointDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ErrorEndpointService);
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
