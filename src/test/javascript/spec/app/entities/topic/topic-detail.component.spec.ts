import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { TopicDetailComponent } from 'app/entities/topic/topic-detail.component';
import { Topic } from 'app/shared/model/topic.model';

describe('Component Tests', () => {
    describe('Topic Management Detail Component', () => {
        let comp: TopicDetailComponent;
        let fixture: ComponentFixture<TopicDetailComponent>;
        const route = ({ data: of({ topic: new Topic(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [TopicDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(TopicDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(TopicDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should load topic on init', () => {
                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.topic).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
