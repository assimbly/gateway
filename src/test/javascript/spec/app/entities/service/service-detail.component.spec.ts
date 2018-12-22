/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ServiceDetailComponent } from 'app/entities/service/service-detail.component';
import { Service } from 'app/shared/model/service.model';

describe('Component Tests', () => {
    describe('Service Management Detail Component', () => {
        let comp: ServiceDetailComponent;
        let fixture: ComponentFixture<ServiceDetailComponent>;
        const route = ({ data: of({ service: new Service(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ServiceDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(ServiceDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(ServiceDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.service).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
