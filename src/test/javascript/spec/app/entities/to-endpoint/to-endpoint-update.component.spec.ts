/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ToEndpointUpdateComponent } from 'app/entities/to-endpoint/to-endpoint-update.component';
import { ToEndpointService } from 'app/entities/to-endpoint/to-endpoint.service';
import { ToEndpoint } from 'app/shared/model/to-endpoint.model';

describe('Component Tests', () => {
    describe('ToEndpoint Management Update Component', () => {
        let comp: ToEndpointUpdateComponent;
        let fixture: ComponentFixture<ToEndpointUpdateComponent>;
        let service: ToEndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ToEndpointUpdateComponent]
            })
                .overrideTemplate(ToEndpointUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ToEndpointUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ToEndpointService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new ToEndpoint(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.toEndpoint = entity;
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
                    const entity = new ToEndpoint();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.toEndpoint = entity;
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
