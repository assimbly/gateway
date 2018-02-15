/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { HeaderComponent } from '../../../../../../main/webapp/app/entities/header/header.component';
import { HeaderService } from '../../../../../../main/webapp/app/entities/header/header.service';
import { Header } from '../../../../../../main/webapp/app/entities/header/header.model';

describe('Component Tests', () => {

    describe('Header Management Component', () => {
        let comp: HeaderComponent;
        let fixture: ComponentFixture<HeaderComponent>;
        let service: HeaderService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderComponent],
                providers: [
                    HeaderService
                ]
            })
            .overrideTemplate(HeaderComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(HeaderComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new Header(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.headers[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
