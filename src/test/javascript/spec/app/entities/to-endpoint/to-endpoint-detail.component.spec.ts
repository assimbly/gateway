/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { ToEndpointDetailComponent } from '../../../../../../main/webapp/app/entities/to-endpoint/to-endpoint-detail.component';
import { ToEndpointService } from '../../../../../../main/webapp/app/entities/to-endpoint/to-endpoint.service';
import { ToEndpoint } from '../../../../../../main/webapp/app/entities/to-endpoint/to-endpoint.model';

describe('Component Tests', () => {

    describe('ToEndpoint Management Detail Component', () => {
        let comp: ToEndpointDetailComponent;
        let fixture: ComponentFixture<ToEndpointDetailComponent>;
        let service: ToEndpointService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ToEndpointDetailComponent],
                providers: [
                    ToEndpointService
                ]
            })
            .overrideTemplate(ToEndpointDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ToEndpointDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ToEndpointService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new ToEndpoint(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.toEndpoint).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
