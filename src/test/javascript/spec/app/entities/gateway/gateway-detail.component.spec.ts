/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { GatewayDetailComponent } from '../../../../../../main/webapp/app/entities/gateway/gateway-detail.component';
import { GatewayService } from '../../../../../../main/webapp/app/entities/gateway/gateway.service';
import { Gateway } from '../../../../../../main/webapp/app/entities/gateway/gateway.model';

describe('Component Tests', () => {

    describe('Gateway Management Detail Component', () => {
        let comp: GatewayDetailComponent;
        let fixture: ComponentFixture<GatewayDetailComponent>;
        let service: GatewayService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [GatewayDetailComponent],
                providers: [
                    GatewayService
                ]
            })
            .overrideTemplate(GatewayDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(GatewayDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(GatewayService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new Gateway(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.gateway).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
