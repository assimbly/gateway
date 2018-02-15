/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { ErrorEndpointDetailComponent } from '../../../../../../main/webapp/app/entities/error-endpoint/error-endpoint-detail.component';
import { ErrorEndpointService } from '../../../../../../main/webapp/app/entities/error-endpoint/error-endpoint.service';
import { ErrorEndpoint } from '../../../../../../main/webapp/app/entities/error-endpoint/error-endpoint.model';

describe('Component Tests', () => {

    describe('ErrorEndpoint Management Detail Component', () => {
        let comp: ErrorEndpointDetailComponent;
        let fixture: ComponentFixture<ErrorEndpointDetailComponent>;
        let service: ErrorEndpointService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ErrorEndpointDetailComponent],
                providers: [
                    ErrorEndpointService
                ]
            })
            .overrideTemplate(ErrorEndpointDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ErrorEndpointDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ErrorEndpointService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new ErrorEndpoint(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.errorEndpoint).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
