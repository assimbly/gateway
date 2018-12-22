/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { FlowComponent } from '../../../../../../main/webapp/app/entities/flow/flow.component';
import { FlowService } from '../../../../../../main/webapp/app/entities/flow/flow.service';
import { Flow } from '../../../../../../main/webapp/app/entities/flow/flow.model';

describe('Component Tests', () => {

    describe('Flow Management Component', () => {
        let comp: FlowComponent;
        let fixture: ComponentFixture<FlowComponent>;
        let service: FlowService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FlowComponent],
                providers: [
                    FlowService
                ]
            })
            .overrideTemplate(FlowComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(FlowComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FlowService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new Flow(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.flows[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
