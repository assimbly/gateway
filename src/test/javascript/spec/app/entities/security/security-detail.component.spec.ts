/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { SecurityDetailComponent } from 'app/entities/security/security-detail.component';
import { Security } from 'app/shared/model/security.model';

describe('Component Tests', () => {
    describe('Security Management Detail Component', () => {
        let comp: SecurityDetailComponent;
        let fixture: ComponentFixture<SecurityDetailComponent>;
        const route = ({ data: of({ security: new Security(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [SecurityDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(SecurityDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(SecurityDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.security).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
