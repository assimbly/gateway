import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IQueue } from 'app/shared/model/queue.model';

@Component({
    standalone: false,
    selector: 'jhi-queue-detail',
    templateUrl: './queue-detail.component.html'
})
export class QueueDetailComponent implements OnInit {
    queue: IQueue | null = null;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ queue }) => (this.queue = queue));
    }

    previousState(): void {
        window.history.back();
    }
}
