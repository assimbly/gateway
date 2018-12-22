/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { EnvironmentVariablesDetailComponent } from 'app/entities/environment-variables/environment-variables-detail.component';
import { EnvironmentVariables } from 'app/shared/model/environment-variables.model';

describe('Component Tests', () => {
    describe('EnvironmentVariables Management Detail Component', () => {
        let comp: EnvironmentVariablesDetailComponent;
        let fixture: ComponentFixture<EnvironmentVariablesDetailComponent>;
        const route = ({ data: of({ environmentVariables: new EnvironmentVariables(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [EnvironmentVariablesDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(EnvironmentVariablesDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(EnvironmentVariablesDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.environmentVariables).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
