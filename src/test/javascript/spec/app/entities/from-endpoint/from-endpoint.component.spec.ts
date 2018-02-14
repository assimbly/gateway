/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { FromEndpointComponent } from '../../../../../../main/webapp/app/entities/from-endpoint/from-endpoint.component';
import { FromEndpointService } from '../../../../../../main/webapp/app/entities/from-endpoint/from-endpoint.service';
import { FromEndpoint } from '../../../../../../main/webapp/app/entities/from-endpoint/from-endpoint.model';

describe('Component Tests', () => {

    describe('FromEndpoint Management Component', () => {
        let comp: FromEndpointComponent;
        let fixture: ComponentFixture<FromEndpointComponent>;
        let service: FromEndpointService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FromEndpointComponent],
                providers: [
                    FromEndpointService
                ]
            })
            .overrideTemplate(FromEndpointComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(FromEndpointComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FromEndpointService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new FromEndpoint(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.fromEndpoints[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
