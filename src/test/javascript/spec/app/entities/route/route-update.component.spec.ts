import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { RouteUpdateComponent } from 'app/entities/route/route-update.component';
import { RouteService } from 'app/entities/route/route.service';
import { Route } from 'app/shared/model/route.model';

describe('Component Tests', () => {
    describe('Route Management Update Component', () => {
        let comp: RouteUpdateComponent;
        let fixture: ComponentFixture<RouteUpdateComponent>;
        let service: RouteService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [RouteUpdateComponent],
                providers: [FormBuilder]
            })
                .overrideTemplate(RouteUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(RouteUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(RouteService);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity', fakeAsync(() => {
                // GIVEN
                const entity = new Route(123);
                spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                comp.updateForm(entity);
                // WHEN
                comp.save();
                tick(); // simulate async

                // THEN
                expect(service.update).toHaveBeenCalledWith(entity);
                expect(comp.isSaving).toEqual(false);
            }));

            it('Should call create service on save for new entity', fakeAsync(() => {
                // GIVEN
                const entity = new Route();
                spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                comp.updateForm(entity);
                // WHEN
                comp.save();
                tick(); // simulate async

                // THEN
                expect(service.create).toHaveBeenCalledWith(entity);
                expect(comp.isSaving).toEqual(false);
            }));
        });
    });
});
