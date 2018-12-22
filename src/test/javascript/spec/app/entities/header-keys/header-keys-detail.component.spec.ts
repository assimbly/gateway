/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { HeaderKeysDetailComponent } from '../../../../../../main/webapp/app/entities/header-keys/header-keys-detail.component';
import { HeaderKeysService } from '../../../../../../main/webapp/app/entities/header-keys/header-keys.service';
import { HeaderKeys } from '../../../../../../main/webapp/app/entities/header-keys/header-keys.model';

describe('Component Tests', () => {

    describe('HeaderKeys Management Detail Component', () => {
        let comp: HeaderKeysDetailComponent;
        let fixture: ComponentFixture<HeaderKeysDetailComponent>;
        let service: HeaderKeysService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderKeysDetailComponent],
                providers: [
                    HeaderKeysService
                ]
            })
            .overrideTemplate(HeaderKeysDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(HeaderKeysDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderKeysService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new HeaderKeys(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.headerKeys).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
