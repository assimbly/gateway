/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { GatewayTestModule } from '../../../test.module';
import { GatewayComponent } from 'app/entities/integration/integration.component';
import { GatewayService } from 'app/entities/integration/integration.service';
import { Gateway } from 'app/shared/model/integration.model';

describe('Component Tests', () => {
    describe('Gateway Management Component', () => {
        let comp: GatewayComponent;
        let fixture: ComponentFixture<GatewayComponent>;
        let service: GatewayService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [GatewayComponent],
                providers: []
            })
                .overrideTemplate(GatewayComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(GatewayComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(GatewayService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new Gateway(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.gateways[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
    });
});
