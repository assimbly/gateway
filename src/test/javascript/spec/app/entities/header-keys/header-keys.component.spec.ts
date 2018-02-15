/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { HeaderKeysComponent } from '../../../../../../main/webapp/app/entities/header-keys/header-keys.component';
import { HeaderKeysService } from '../../../../../../main/webapp/app/entities/header-keys/header-keys.service';
import { HeaderKeys } from '../../../../../../main/webapp/app/entities/header-keys/header-keys.model';

describe('Component Tests', () => {

    describe('HeaderKeys Management Component', () => {
        let comp: HeaderKeysComponent;
        let fixture: ComponentFixture<HeaderKeysComponent>;
        let service: HeaderKeysService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderKeysComponent],
                providers: [
                    HeaderKeysService
                ]
            })
            .overrideTemplate(HeaderKeysComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(HeaderKeysComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderKeysService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new HeaderKeys(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.headerKeys[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
