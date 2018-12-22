/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ServiceKeysUpdateComponent } from 'app/entities/service-keys/service-keys-update.component';
import { ServiceKeysService } from 'app/entities/service-keys/service-keys.service';
import { ServiceKeys } from 'app/shared/model/service-keys.model';

describe('Component Tests', () => {
    describe('ServiceKeys Management Update Component', () => {
        let comp: ServiceKeysUpdateComponent;
        let fixture: ComponentFixture<ServiceKeysUpdateComponent>;
        let service: ServiceKeysService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ServiceKeysUpdateComponent]
            })
                .overrideTemplate(ServiceKeysUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ServiceKeysUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ServiceKeysService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new ServiceKeys(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.serviceKeys = entity;
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
                    const entity = new ServiceKeys();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.serviceKeys = entity;
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
