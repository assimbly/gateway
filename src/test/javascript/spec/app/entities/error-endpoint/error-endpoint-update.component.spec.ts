/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ErrorEndpointUpdateComponent } from 'app/entities/error-endpoint/error-endpoint-update.component';
import { ErrorEndpointService } from 'app/entities/error-endpoint/error-endpoint.service';
import { ErrorEndpoint } from 'app/shared/model/error-endpoint.model';

describe('Component Tests', () => {
    describe('ErrorEndpoint Management Update Component', () => {
        let comp: ErrorEndpointUpdateComponent;
        let fixture: ComponentFixture<ErrorEndpointUpdateComponent>;
        let service: ErrorEndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ErrorEndpointUpdateComponent]
            })
                .overrideTemplate(ErrorEndpointUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ErrorEndpointUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ErrorEndpointService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new ErrorEndpoint(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.errorEndpoint = entity;
                    // WHEN
                    comp.save();
                    tick(); // simulate async

                    // THEN
                    expect(service.update).toHaveBeenCalledWith(entity);
                    expect(comp.isSaving).toEqual(false);
                })
            );

            it(
                'Should call create service on save for new entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new ErrorEndpoint();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.errorEndpoint = entity;
                    // WHEN
                    comp.save();
                    tick(); // simulate async

                    // THEN
                    expect(service.create).toHaveBeenCalledWith(entity);
                    expect(comp.isSaving).toEqual(false);
                })
            );
        });
    });
});
