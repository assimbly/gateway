import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { QueueDetailComponent } from 'app/entities/queue/queue-detail.component';
import { Queue } from 'app/shared/model/queue.model';

describe('Component Tests', () => {
    describe('Queue Management Detail Component', () => {
        let comp: QueueDetailComponent;
        let fixture: ComponentFixture<QueueDetailComponent>;
        const route = ({ data: of({ queue: new Queue(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [QueueDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(QueueDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(QueueDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should load queue on init', () => {
                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.queue).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
