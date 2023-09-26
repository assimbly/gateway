/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { ConnectionKeysComponent } from 'app/entities/connection-keys/connection-keys.component';
import { ConnectionKeysService } from 'app/entities/connection-keys/connection-keys.service';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';

describe('Component Tests', () => {
    describe('ConnectionKeys Management Component', () => {
        let comp: ConnectionKeysComponent;
        let fixture: ComponentFixture<ConnectionKeysComponent>;
        let service: ConnectionKeysService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ConnectionKeysComponent],
                providers: []
            })
                .overrideTemplate(ConnectionKeysComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ConnectionKeysComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ConnectionKeysService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new ConnectionKeys(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.connectionKeys[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
