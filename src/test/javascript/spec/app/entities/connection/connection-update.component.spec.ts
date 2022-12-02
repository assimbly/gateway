/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ConnectionUpdateComponent } from 'app/entities/connection/connection-update.component';
import { ConnectionService } from 'app/entities/connection/connection.service';
import { Connection } from 'app/shared/model/connection.model';

describe('Component Tests', () => {
    describe('Connection Management Update Component', () => {
        let comp: ConnectionUpdateComponent;
        let fixture: ComponentFixture<ConnectionUpdateComponent>;
        let connection: ConnectionService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ConnectionUpdateComponent]
            })
                .overrideTemplate(ConnectionUpdateComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ConnectionUpdateComponent);
            comp = fixture.componentInstance;
            connection = fixture.debugElement.injector.get(ConnectionService);
        });

        describe('save', () => {
            it(
                'Should call update connection on save for existing entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new Connection(123);
                    spyOn(connection, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.connection = entity;
                    // WHEN
                    comp.save();
                    tick(); // simulate async

                    // THEN
                    expect(connection.update).toHaveBeenCalledWith(entity);
                    expect(comp.isSaving).toEqual(false);
                })
            );

            it(
                'Should call create connection on save for new entity',
                fakeAsync(() => {
                    // GIVEN
                    const entity = new Connection();
                    spyOn(connection, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
                    comp.connection = entity;
                    // WHEN
                    comp.save();
                    tick(); // simulate async

                    // THEN
                    expect(connection.create).toHaveBeenCalledWith(entity);
                    expect(comp.isSaving).toEqual(false);
                })
            );
        });
    });
});
