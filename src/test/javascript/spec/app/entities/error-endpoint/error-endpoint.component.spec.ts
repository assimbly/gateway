/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { ErrorEndpointComponent } from '../../../../../../main/webapp/app/entities/error-endpoint/error-endpoint.component';
import { ErrorEndpointService } from '../../../../../../main/webapp/app/entities/error-endpoint/error-endpoint.service';
import { ErrorEndpoint } from '../../../../../../main/webapp/app/entities/error-endpoint/error-endpoint.model';

describe('Component Tests', () => {

    describe('ErrorEndpoint Management Component', () => {
        let comp: ErrorEndpointComponent;
        let fixture: ComponentFixture<ErrorEndpointComponent>;
        let service: ErrorEndpointService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ErrorEndpointComponent],
                providers: [
                    ErrorEndpointService
                ]
            })
            .overrideTemplate(ErrorEndpointComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ErrorEndpointComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ErrorEndpointService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new ErrorEndpoint(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.errorEndpoints[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
