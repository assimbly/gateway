/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { HeaderDialogComponent } from '../../../../../../main/webapp/app/entities/header/header-dialog.component';
import { HeaderService } from '../../../../../../main/webapp/app/entities/header/header.service';
import { Header } from '../../../../../../main/webapp/app/entities/header/header.model';

describe('Component Tests', () => {

    describe('Header Management Dialog Component', () => {
        let comp: HeaderDialogComponent;
        let fixture: ComponentFixture<HeaderDialogComponent>;
        let service: HeaderService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderDialogComponent],
                providers: [
                    HeaderService
                ]
            })
            .overrideTemplate(HeaderDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(HeaderDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Header(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.header = entity;
                        // WHEN
                        comp.save(true);
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'headerListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Header();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.header = entity;
                        // WHEN
                        comp.save(true);
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'headerListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
