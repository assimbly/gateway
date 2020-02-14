/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { SecurityUpdateComponent } from 'app/entities/security/security-update.component';
import { SecurityService } from 'app/entities/security/security.service';
import { Security } from 'app/shared/model/security.model';

describe('Component Tests', () => {
    describe('Security Management Update Component', () => {
        let comp: SecurityUpdateComponent;
        let fixture: ComponentFixture<SecurityUpdateComponent>;
        let service: SecurityService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [SecurityUpdateComponent]
            })
                .overrideTemplate(SecurityUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(SecurityUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(SecurityService);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity', fakeAsync(() => {
                // GIVEN
                const entity = new Security(123);
                spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                comp.security = entity;
                // WHEN
                comp.add();
                tick(); // simulate async

                // THEN
                expect(service.update).toHaveBeenCalledWith(entity);
                expect(comp.isSaving).toEqual(false);
            }));

            it('Should call create service on save for new entity', fakeAsync(() => {
                // GIVEN
                const entity = new Security();
                spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                comp.security = entity;
                // WHEN
                comp.add();
                tick(); // simulate async

                // THEN
                expect(service.create).toHaveBeenCalledWith(entity);
                expect(comp.isSaving).toEqual(false);
            }));
        });
    });
});
