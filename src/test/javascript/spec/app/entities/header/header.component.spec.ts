/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { HeaderComponent } from 'app/entities/message/message.component';
import { HeaderService } from 'app/entities/message/message.service';
import { Header } from 'app/shared/model/message.model';

describe('Component Tests', () => {
    describe('Header Management Component', () => {
        let comp: HeaderComponent;
        let fixture: ComponentFixture<HeaderComponent>;
        let service: HeaderService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderComponent],
                providers: []
            })
                .overrideTemplate(HeaderComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(HeaderComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new Header(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.headers[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
