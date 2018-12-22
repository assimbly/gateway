/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { WireTapEndpointUpdateComponent } from 'app/entities/wire-tap-endpoint/wire-tap-endpoint-update.component';
import { WireTapEndpointService } from 'app/entities/wire-tap-endpoint/wire-tap-endpoint.service';
import { WireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';

describe('Component Tests', () => {
    describe('WireTapEndpoint Management Update Component', () => {
        let comp: WireTapEndpointUpdateComponent;
        let fixture: ComponentFixture<WireTapEndpointUpdateComponent>;
        let service: WireTapEndpointService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [WireTapEndpointUpdateComponent]
            })
                .overrideTemplate(WireTapEndpointUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(WireTapEndpointUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(WireTapEndpointService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new WireTapEndpoint(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.wireTapEndpoint = entity;
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
                    const entity = new WireTapEndpoint();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.wireTapEndpoint = entity;
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
