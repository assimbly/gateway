/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { ServiceKeysDetailComponent } from 'app/entities/service-keys/service-keys-detail.component';
import { ServiceKeys } from 'app/shared/model/service-keys.model';

describe('Component Tests', () => {
    describe('ServiceKeys Management Detail Component', () => {
        let comp: ServiceKeysDetailComponent;
        let fixture: ComponentFixture<ServiceKeysDetailComponent>;
        const route = ({ data: of({ serviceKeys: new ServiceKeys(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [ServiceKeysDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(ServiceKeysDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(ServiceKeysDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.serviceKeys).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
