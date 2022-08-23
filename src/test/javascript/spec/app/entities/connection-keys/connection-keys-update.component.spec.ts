/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ConnectionKeysUpdateComponent } from 'app/entities/connection-keys/connection-keys-update.component';
import { ConnectionKeysService } from 'app/entities/connection-keys/connection-keys.service';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';

describe('Component Tests', () => {
    describe('ConnectionKeys Management Update Component', () => {
        let comp: ConnectionKeysUpdateComponent;
        let fixture: ComponentFixture<ConnectionKeysUpdateComponent>;
        let service: ConnectionKeysService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ConnectionKeysUpdateComponent]
            })
                .overrideTemplate(ConnectionKeysUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ConnectionKeysUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ConnectionKeysService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new ConnectionKeys(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.connectionKeys = entity;
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
                    const entity = new ConnectionKeys();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.connectionKeys = entity;
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
