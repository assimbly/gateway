/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { EnvironmentVariablesDeleteDialogComponent } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables-delete-dialog.component';
import { EnvironmentVariablesService } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables.service';

describe('Component Tests', () => {

    describe('EnvironmentVariables Management Delete Component', () => {
        let comp: EnvironmentVariablesDeleteDialogComponent;
        let fixture: ComponentFixture<EnvironmentVariablesDeleteDialogComponent>;
        let service: EnvironmentVariablesService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EnvironmentVariablesDeleteDialogComponent],
                providers: [
                    EnvironmentVariablesService
                ]
            })
            .overrideTemplate(EnvironmentVariablesDeleteDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(EnvironmentVariablesDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(EnvironmentVariablesService);
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
