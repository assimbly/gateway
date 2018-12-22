/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { GatewayTestModule } from '../../../test.module';
import { GroupDetailComponent } from '../../../../../../main/webapp/app/entities/group/group-detail.component';
import { GroupService } from '../../../../../../main/webapp/app/entities/group/group.service';
import { Group } from '../../../../../../main/webapp/app/entities/group/group.model';

describe('Component Tests', () => {

    describe('Group Management Detail Component', () => {
        let comp: GroupDetailComponent;
        let fixture: ComponentFixture<GroupDetailComponent>;
        let service: GroupService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [GroupDetailComponent],
                providers: [
                    GroupService
                ]
            })
            .overrideTemplate(GroupDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(GroupDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(GroupService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new Group(123)));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.group).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
