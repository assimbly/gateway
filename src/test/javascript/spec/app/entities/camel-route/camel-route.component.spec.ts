/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { CamelRouteComponent } from '../../../../../../main/webapp/app/entities/camel-route/camel-route.component';
import { CamelRouteService } from '../../../../../../main/webapp/app/entities/camel-route/camel-route.service';
import { CamelRoute } from '../../../../../../main/webapp/app/entities/camel-route/camel-route.model';

describe('Component Tests', () => {

    describe('CamelRoute Management Component', () => {
        let comp: CamelRouteComponent;
        let fixture: ComponentFixture<CamelRouteComponent>;
        let service: CamelRouteService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [CamelRouteComponent],
                providers: [
                    CamelRouteService
                ]
            })
            .overrideTemplate(CamelRouteComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(CamelRouteComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(CamelRouteService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new CamelRoute(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.camelRoutes[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
