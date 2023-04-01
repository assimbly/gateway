/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { HeaderKeysDetailComponent } from 'app/entities/message-keys/message-keys-detail.component';
import { HeaderKeys } from 'app/shared/model/message-keys.model';

describe('Component Tests', () => {
    describe('HeaderKeys Management Detail Component', () => {
        let comp: HeaderKeysDetailComponent;
        let fixture: ComponentFixture<HeaderKeysDetailComponent>;
        const route = ({ data: of({ header: new HeaderKeys(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderKeysDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(HeaderKeysDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(HeaderKeysDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.header).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
