/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { HeaderKeysDialogComponent } from '../../../../../../main/webapp/app/entities/header-keys/header-keys-dialog.component';
import { HeaderKeysService } from '../../../../../../main/webapp/app/entities/header-keys/header-keys.service';
import { HeaderKeys } from '../../../../../../main/webapp/app/entities/header-keys/header-keys.model';
import { HeaderService } from '../../../../../../main/webapp/app/entities/header';

describe('Component Tests', () => {

    describe('HeaderKeys Management Dialog Component', () => {
        let comp: HeaderKeysDialogComponent;
        let fixture: ComponentFixture<HeaderKeysDialogComponent>;
        let service: HeaderKeysService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderKeysDialogComponent],
                providers: [
                    HeaderService,
                    HeaderKeysService
                ]
            })
            .overrideTemplate(HeaderKeysDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(HeaderKeysDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderKeysService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new HeaderKeys(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.headerKeys = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'headerKeysListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new HeaderKeys();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.headerKeys = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'headerKeysListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
