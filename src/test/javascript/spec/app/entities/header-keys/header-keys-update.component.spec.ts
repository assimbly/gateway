/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { HeaderKeysUpdateComponent } from 'app/entities/header-keys/header-keys-update.component';
import { HeaderKeysService } from 'app/entities/header-keys/header-keys.service';
import { HeaderKeys } from 'app/shared/model/header-keys.model';

describe('Component Tests', () => {
    describe('HeaderKeys Management Update Component', () => {
        let comp: HeaderKeysUpdateComponent;
        let fixture: ComponentFixture<HeaderKeysUpdateComponent>;
        let service: HeaderKeysService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderKeysUpdateComponent]
            })
                .overrideTemplate(HeaderKeysUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(HeaderKeysUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderKeysService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new HeaderKeys(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.headerKeys = entity;
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
                    const entity = new HeaderKeys();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.headerKeys = entity;
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
