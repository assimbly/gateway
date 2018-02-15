/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { CamelRouteDetailComponent } from '../../../../../../main/webapp/app/entities/camel-route/camel-route-detail.component';
import { CamelRouteService } from '../../../../../../main/webapp/app/entities/camel-route/camel-route.service';
import { CamelRoute } from '../../../../../../main/webapp/app/entities/camel-route/camel-route.model';

describe('Component Tests', () => {

    describe('CamelRoute Management Detail Component', () => {
        let comp: CamelRouteDetailComponent;
        let fixture: ComponentFixture<CamelRouteDetailComponent>;
        let service: CamelRouteService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [CamelRouteDetailComponent],
                providers: [
                    CamelRouteService
                ]
            })
            .overrideTemplate(CamelRouteDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(CamelRouteDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(CamelRouteService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new CamelRoute(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.camelRoute).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
