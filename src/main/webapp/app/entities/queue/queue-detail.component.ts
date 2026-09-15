import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IQueue } from 'app/shared/model/queue.model';

@Component({
    selector: 'jhi-queue-detail',
    templateUrl: './queue-detail.component.html',
    imports: [CommonModule, RouterModule, FontAwesomeModule, AlertError],
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
