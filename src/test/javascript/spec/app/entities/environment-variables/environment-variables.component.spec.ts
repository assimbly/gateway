/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { EnvironmentVariablesComponent } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables.component';
import { EnvironmentVariablesService } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables.service';
import { EnvironmentVariables } from '../../../../../../main/webapp/app/entities/environment-variables/environment-variables.model';

describe('Component Tests', () => {

    describe('EnvironmentVariables Management Component', () => {
        let comp: EnvironmentVariablesComponent;
        let fixture: ComponentFixture<EnvironmentVariablesComponent>;
        let service: EnvironmentVariablesService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EnvironmentVariablesComponent],
                providers: [
                    EnvironmentVariablesService
                ]
            })
            .overrideTemplate(EnvironmentVariablesComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(EnvironmentVariablesComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(EnvironmentVariablesService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new EnvironmentVariables(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.environmentVariables[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
