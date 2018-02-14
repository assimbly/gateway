/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { ToEndpointComponent } from '../../../../../../main/webapp/app/entities/to-endpoint/to-endpoint.component';
import { ToEndpointService } from '../../../../../../main/webapp/app/entities/to-endpoint/to-endpoint.service';
import { ToEndpoint } from '../../../../../../main/webapp/app/entities/to-endpoint/to-endpoint.model';

describe('Component Tests', () => {

    describe('ToEndpoint Management Component', () => {
        let comp: ToEndpointComponent;
        let fixture: ComponentFixture<ToEndpointComponent>;
        let service: ToEndpointService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ToEndpointComponent],
                providers: [
                    ToEndpointService
                ]
            })
            .overrideTemplate(ToEndpointComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ToEndpointComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ToEndpointService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new ToEndpoint(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.toEndpoints[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
