/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { EnvironmentVariablesDetailComponent } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables-detail.component';
import { EnvironmentVariablesService } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables.service';
import { EnvironmentVariables } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables.model';

describe('Component Tests', () => {

    describe('EnvironmentVariables Management Detail Component', () => {
        let comp: EnvironmentVariablesDetailComponent;
        let fixture: ComponentFixture<EnvironmentVariablesDetailComponent>;
        let service: EnvironmentVariablesService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EnvironmentVariablesDetailComponent],
                providers: [
                    EnvironmentVariablesService
                ]
            })
            .overrideTemplate(EnvironmentVariablesDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(EnvironmentVariablesDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(EnvironmentVariablesService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new EnvironmentVariables(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.environmentVariables).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
