/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { HeaderDetailComponent } from '../../../../../../main/webapp/app/entities/header/header-detail.component';
import { HeaderService } from '../../../../../../main/webapp/app/entities/header/header.service';
import { Header } from '../../../../../../main/webapp/app/entities/header/header.model';

describe('Component Tests', () => {

    describe('Header Management Detail Component', () => {
        let comp: HeaderDetailComponent;
        let fixture: ComponentFixture<HeaderDetailComponent>;
        let service: HeaderService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderDetailComponent],
                providers: [
                    HeaderService
                ]
            })
            .overrideTemplate(HeaderDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(HeaderDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(HeaderService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new Header(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.header).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
