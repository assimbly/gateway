import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { ITopic } from 'app/shared/model/topic.model';

@Component({
  selector: 'jhi-topic-detail',
  templateUrl: './topic-detail.component.html',
  imports: [RouterModule, FontAwesomeModule, AlertError],
})
export class TopicDetailComponent implements OnInit {
    protected activatedRoute = inject(ActivatedRoute);

    topic: ITopic | null = null;

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ topic }) => (this.topic = topic));
    }

    previousState(): void {
        window.history.back();
    }
}
