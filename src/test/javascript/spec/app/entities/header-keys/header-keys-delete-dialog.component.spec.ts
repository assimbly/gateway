/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { HeaderKeysDeleteDialogComponent } from '../../../../../../main/webapp/app/entities/header-keys/header-keys-delete-dialog.component';
import { HeaderKeysService } from '../../../../../../main/webapp/app/entities/header-keys/header-keys.service';

describe('Component Tests', () => {

    describe('HeaderKeys Management Delete Component', () => {
        let comp: HeaderKeysDeleteDialogComponent;
        let fixture: ComponentFixture<HeaderKeysDeleteDialogComponent>;
        let service: HeaderKeysService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderKeysDeleteDialogComponent],
                providers: [
                    HeaderKeysService
                ]
            })
            .overrideTemplate(HeaderKeysDeleteDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(HeaderKeysDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderKeysService);
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
