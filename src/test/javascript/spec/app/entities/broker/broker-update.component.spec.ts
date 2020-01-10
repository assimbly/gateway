/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { BrokerUpdateComponent } from 'app/entities/broker/broker-update.component';
import { BrokerService } from 'app/entities/broker/broker.service';
import { Broker } from 'app/shared/model/broker.model';

describe('Component Tests', () => {
    describe('Broker Management Update Component', () => {
        let comp: BrokerUpdateComponent;
        let fixture: ComponentFixture<BrokerUpdateComponent>;
        let service: BrokerService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [BrokerUpdateComponent]
            })
                .overrideTemplate(BrokerUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(BrokerUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(BrokerService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new Broker(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.broker = entity;
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
                    const entity = new Broker();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.broker = entity;
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
