/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { HeaderKeysComponent } from 'app/entities/message-keys/message-keys.component';
import { HeaderKeysService } from 'app/entities/message-keys/message-keys.service';
import { HeaderKeys } from 'app/shared/model/message-keys.model';

describe('Component Tests', () => {
    describe('HeaderKeys Management Component', () => {
        let comp: HeaderKeysComponent;
        let fixture: ComponentFixture<HeaderKeysComponent>;
        let service: HeaderKeysService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderKeysComponent],
                providers: []
            })
                .overrideTemplate(HeaderKeysComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(HeaderKeysComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderKeysService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new HeaderKeys(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.header[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
