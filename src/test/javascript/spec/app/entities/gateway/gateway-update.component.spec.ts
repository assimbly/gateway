/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { GatewayUpdateComponent } from 'app/entities/gateway/gateway-update.component';
import { GatewayService } from 'app/entities/gateway/gateway.service';
import { Gateway } from 'app/shared/model/gateway.model';

describe('Component Tests', () => {
    describe('Gateway Management Update Component', () => {
        let comp: GatewayUpdateComponent;
        let fixture: ComponentFixture<GatewayUpdateComponent>;
        let service: GatewayService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [GatewayUpdateComponent]
            })
                .overrideTemplate(GatewayUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(GatewayUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(GatewayService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new Gateway(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.gateway = entity;
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
                    const entity = new Gateway();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.gateway = entity;
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
