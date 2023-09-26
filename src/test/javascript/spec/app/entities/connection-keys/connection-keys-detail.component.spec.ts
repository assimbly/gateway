/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ConnectionKeysDetailComponent } from 'app/entities/connection-keys/connection-keys-detail.component';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';

describe('Component Tests', () => {
    describe('ConnectionKeys Management Detail Component', () => {
        let comp: ConnectionKeysDetailComponent;
        let fixture: ComponentFixture<ConnectionKeysDetailComponent>;
        const route = ({ data: of({ connectionKeys: new ConnectionKeys(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ConnectionKeysDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(ConnectionKeysDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(ConnectionKeysDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.connectionKeys).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
