/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ConnectionDetailComponent } from 'app/entities/connection/connection-detail.component';
import { Connection } from 'app/shared/model/connection.model';

describe('Component Tests', () => {
    describe('Connection Management Detail Component', () => {
        let comp: ConnectionDetailComponent;
        let fixture: ComponentFixture<ConnectionDetailComponent>;
        const route = ({ data: of({ connection: new Connection(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ConnectionDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(ConnectionDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(ConnectionDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.connection).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
