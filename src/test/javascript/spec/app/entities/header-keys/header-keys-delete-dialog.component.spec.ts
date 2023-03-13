/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { HeaderKeysDeleteDialogComponent } from 'app/entities/message-keys/message-keys-delete-dialog.component';
import { HeaderKeysService } from 'app/entities/message-keys/message-keys.service';

describe('Component Tests', () => {
    describe('HeaderKeys Management Delete Component', () => {
        let comp: HeaderKeysDeleteDialogComponent;
        let fixture: ComponentFixture<HeaderKeysDeleteDialogComponent>;
        let service: HeaderKeysService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderKeysDeleteDialogComponent]
            })
                .overrideTemplate(HeaderKeysDeleteDialogComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(HeaderKeysDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderKeysService);
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
