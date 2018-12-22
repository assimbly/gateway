/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { FlowDetailComponent } from '../../../../../../main/webapp/app/entities/flow/flow-detail.component';
import { FlowService } from '../../../../../../main/webapp/app/entities/flow/flow.service';
import { Flow } from '../../../../../../main/webapp/app/entities/flow/flow.model';

describe('Component Tests', () => {

    describe('Flow Management Detail Component', () => {
        let comp: FlowDetailComponent;
        let fixture: ComponentFixture<FlowDetailComponent>;
        let service: FlowService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [FlowDetailComponent],
                providers: [
                    FlowService
                ]
            })
            .overrideTemplate(FlowDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(FlowDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(FlowService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new Flow(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.flow).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
