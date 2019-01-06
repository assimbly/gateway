/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { EnvironmentVariablesUpdateComponent } from 'app/entities/environment-variables/environment-variables-update.component';
import { EnvironmentVariablesService } from 'app/entities/environment-variables/environment-variables.service';
import { EnvironmentVariables } from 'app/shared/model/environment-variables.model';

describe('Component Tests', () => {
    describe('EnvironmentVariables Management Update Component', () => {
        let comp: EnvironmentVariablesUpdateComponent;
        let fixture: ComponentFixture<EnvironmentVariablesUpdateComponent>;
        let service: EnvironmentVariablesService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EnvironmentVariablesUpdateComponent]
            })
                .overrideTemplate(EnvironmentVariablesUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(EnvironmentVariablesUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(EnvironmentVariablesService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new EnvironmentVariables(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.environmentVariables = entity;
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
                    const entity = new EnvironmentVariables();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.environmentVariables = entity;
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
