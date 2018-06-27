/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';

import { GatewayTestModule } from '../../../test.module';
import { GroupComponent } from '../../../../../../main/webapp/app/entities/group/group.component';
import { GroupService } from '../../../../../../main/webapp/app/entities/group/group.service';
import { Group } from '../../../../../../main/webapp/app/entities/group/group.model';

describe('Component Tests', () => {

    describe('Group Management Component', () => {
        let comp: GroupComponent;
        let fixture: ComponentFixture<GroupComponent>;
        let service: GroupService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [GroupComponent],
                providers: [
                    GroupService
                ]
            })
            .overrideTemplate(GroupComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(GroupComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(GroupService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new Headers();
                headers.append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of({
                    json: [new Group(123)],
                    headers
                }));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.groups[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
