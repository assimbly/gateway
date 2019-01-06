/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { FromEndpointUpdateComponent } from 'app/entities/from-endpoint/from-endpoint-update.component';
import { FromEndpointService } from 'app/entities/from-endpoint/from-endpoint.service';
import { FromEndpoint } from 'app/shared/model/from-endpoint.model';

describe('Component Tests', () => {
    describe('FromEndpoint Management Update Component', () => {
        let comp: FromEndpointUpdateComponent;
        let fixture: ComponentFixture<FromEndpointUpdateComponent>;
        let service: FromEndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FromEndpointUpdateComponent]
            })
                .overrideTemplate(FromEndpointUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(FromEndpointUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FromEndpointService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new FromEndpoint(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.fromEndpoint = entity;
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
                    const entity = new FromEndpoint();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.fromEndpoint = entity;
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
