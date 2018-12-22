/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { GroupDetailComponent } from 'app/entities/group/group-detail.component';
import { Group } from 'app/shared/model/group.model';

describe('Component Tests', () => {
    describe('Group Management Detail Component', () => {
        let comp: GroupDetailComponent;
        let fixture: ComponentFixture<GroupDetailComponent>;
        const route = ({ data: of({ group: new Group(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [GroupDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(GroupDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(GroupDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.group).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
