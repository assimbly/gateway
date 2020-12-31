/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { EndpointUpdateComponent } from 'app/entities/endpoint/endpoint-update.component';
import { EndpointService } from 'app/entities/endpoint/endpoint.service';
import { Endpoint } from 'app/shared/model/endpoint.model';

describe('Component Tests', () => {
    describe('Endpoint Management Update Component', () => {
        let comp: EndpointUpdateComponent;
        let fixture: ComponentFixture<EndpointUpdateComponent>;
        let service: EndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EndpointUpdateComponent]
            })
                .overrideTemplate(EndpointUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(EndpointUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(EndpointService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new Endpoint(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.endpoint = entity;
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
                    const entity = new Endpoint();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.endpoint = entity;
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
