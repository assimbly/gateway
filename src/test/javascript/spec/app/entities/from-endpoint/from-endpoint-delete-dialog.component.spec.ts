/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { FromEndpointDeleteDialogComponent } from 'app/entities/from-endpoint/from-endpoint-delete-dialog.component';
import { FromEndpointService } from 'app/entities/from-endpoint/from-endpoint.service';

describe('Component Tests', () => {
    describe('FromEndpoint Management Delete Component', () => {
        let comp: FromEndpointDeleteDialogComponent;
        let fixture: ComponentFixture<FromEndpointDeleteDialogComponent>;
        let service: FromEndpointService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FromEndpointDeleteDialogComponent]
            })
                .overrideTemplate(FromEndpointDeleteDialogComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(FromEndpointDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FromEndpointService);
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
