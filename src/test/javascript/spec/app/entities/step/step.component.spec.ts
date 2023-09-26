/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { stepComponent } from 'app/entities/step/step.component';
import { stepService } from 'app/entities/step/step.service';
import { step } from 'app/shared/model/step.model';

describe('Component Tests', () => {
    describe('step Management Component', () => {
        let comp: stepComponent;
        let fixture: ComponentFixture<stepComponent>;
        let service: stepService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [stepComponent],
                providers: []
            })
                .overrideTemplate(stepComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(stepComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(stepService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new step(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.steps[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
