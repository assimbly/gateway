import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { JhiDataUtils } from 'ng-jhipster';

import { GatewayTestModule } from '../../../test.module';
import { RouteDetailComponent } from 'app/entities/route/route-detail.component';
import { Route } from 'app/shared/model/route.model';

describe('Component Tests', () => {
    describe('Route Management Detail Component', () => {
        let comp: RouteDetailComponent;
        let fixture: ComponentFixture<RouteDetailComponent>;
        let dataUtils: JhiDataUtils;
        const route = ({ data: of({ route: new Route(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [RouteDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(RouteDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(RouteDetailComponent);
            comp = fixture.componentInstance;
            dataUtils = fixture.debugElement.injector.get(JhiDataUtils);
        });

        describe('OnInit', () => {
            it('Should load route on init', () => {
                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.route).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });

        describe('byteSize', () => {
            it('Should call byteSize from JhiDataUtils', () => {
                // GIVEN
                spyOn(dataUtils, 'byteSize');
                const fakeBase64 = 'fake base64';

                // WHEN
                comp.byteSize(fakeBase64);

                // THEN
                expect(dataUtils.byteSize).toBeCalledWith(fakeBase64);
            });
        });

        describe('openFile', () => {
            it('Should call openFile from JhiDataUtils', () => {
                // GIVEN
                spyOn(dataUtils, 'openFile');
                const fakeContentType = 'fake content type';
                const fakeBase64 = 'fake base64';

                // WHEN
                comp.openFile(fakeContentType, fakeBase64);

                // THEN
                expect(dataUtils.openFile).toBeCalledWith(fakeContentType, fakeBase64);
            });
        });
    });
});
