/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { FromEndpointDetailComponent } from '../../../../../../main/webapp/app/entities/from-endpoint/from-endpoint-detail.component';
import { FromEndpointService } from '../../../../../../main/webapp/app/entities/from-endpoint/from-endpoint.service';
import { FromEndpoint } from '../../../../../../main/webapp/app/entities/from-endpoint/from-endpoint.model';

describe('Component Tests', () => {

    describe('FromEndpoint Management Detail Component', () => {
        let comp: FromEndpointDetailComponent;
        let fixture: ComponentFixture<FromEndpointDetailComponent>;
        let service: FromEndpointService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FromEndpointDetailComponent],
                providers: [
                    FromEndpointService
                ]
            })
            .overrideTemplate(FromEndpointDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(FromEndpointDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FromEndpointService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new FromEndpoint(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.fromEndpoint).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
