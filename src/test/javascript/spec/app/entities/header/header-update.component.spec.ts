/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { HeaderUpdateComponent } from 'app/entities/message/message-update.component';
import { HeaderService } from 'app/entities/message/message.service';
import { Header } from 'app/shared/model/message.model';

describe('Component Tests', () => {
    describe('Header Management Update Component', () => {
        let comp: HeaderUpdateComponent;
        let fixture: ComponentFixture<HeaderUpdateComponent>;
        let service: HeaderService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderUpdateComponent]
            })
                .overrideTemplate(HeaderUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(HeaderUpdateComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderService);
        });

        describe('save', () => {
            it(
                'Should call update service on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new Header(123);
                    spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.message = entity;
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
                    const entity = new Header();
                    spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.message = entity;
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
