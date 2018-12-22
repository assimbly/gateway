/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { GatewayComponent } from '../../../../../../main/webapp/app/entities/gateway/gateway.component';
import { GatewayService } from '../../../../../../main/webapp/app/entities/gateway/gateway.service';
import { Gateway } from '../../../../../../main/webapp/app/entities/gateway/gateway.model';

describe('Component Tests', () => {

    describe('Gateway Management Component', () => {
        let comp: GatewayComponent;
        let fixture: ComponentFixture<GatewayComponent>;
        let service: GatewayService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [GatewayComponent],
                providers: [
                    GatewayService
                ]
            })
            .overrideTemplate(GatewayComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(GatewayComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(GatewayService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new Gateway(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.gateways[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
