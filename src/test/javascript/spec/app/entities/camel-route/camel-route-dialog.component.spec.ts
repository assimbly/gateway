/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { CamelRouteDialogComponent } from '../../../../../../main/webapp/app/entities/camel-route/camel-route-dialog.component';
import { CamelRouteService } from '../../../../../../main/webapp/app/entities/camel-route/camel-route.service';
import { CamelRoute } from '../../../../../../main/webapp/app/entities/camel-route/camel-route.model';
import { GatewayService } from '../../../../../../main/webapp/app/entities/gateway';
import { FromEndpointService } from '../../../../../../main/webapp/app/entities/from-endpoint';
import { ErrorEndpointService } from '../../../../../../main/webapp/app/entities/error-endpoint';

describe('Component Tests', () => {

    describe('CamelRoute Management Dialog Component', () => {
        let comp: CamelRouteDialogComponent;
        let fixture: ComponentFixture<CamelRouteDialogComponent>;
        let service: CamelRouteService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [CamelRouteDialogComponent],
                providers: [
                    GatewayService,
                    FromEndpointService,
                    ErrorEndpointService,
                    CamelRouteService
                ]
            })
            .overrideTemplate(CamelRouteDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(CamelRouteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(CamelRouteService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new CamelRoute(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(entity));
                        comp.camelRoute = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'camelRouteListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new CamelRoute();
                        spyOn(service, 'create').and.returnValue(Observable.of(entity));
                        comp.camelRoute = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'camelRouteListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
