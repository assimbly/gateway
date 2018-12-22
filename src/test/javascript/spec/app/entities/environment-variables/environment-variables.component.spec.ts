/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { EnvironmentVariablesComponent } from 'app/entities/environment-variables/environment-variables.component';
import { EnvironmentVariablesService } from 'app/entities/environment-variables/environment-variables.service';
import { EnvironmentVariables } from 'app/shared/model/environment-variables.model';

describe('Component Tests', () => {
    describe('EnvironmentVariables Management Component', () => {
        let comp: EnvironmentVariablesComponent;
        let fixture: ComponentFixture<EnvironmentVariablesComponent>;
        let service: EnvironmentVariablesService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EnvironmentVariablesComponent],
                providers: []
            })
                .overrideTemplate(EnvironmentVariablesComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(EnvironmentVariablesComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(EnvironmentVariablesService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new EnvironmentVariables(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.environmentVariables[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
