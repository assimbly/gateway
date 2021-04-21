import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { IQueue, Queue } from 'app/shared/model/queue.model';
import { QueueService } from './queue.service';

@Component({
    selector: 'jhi-queue-update',
    templateUrl: './queue-update.component.html'
})
export class QueueUpdateComponent implements OnInit {
    isSaving = false;

    editForm = this.fb.group({
        id: [],
        itemsOnPage: [],
        refreshInterval: [],
        selectedColumn: [],
        orderColumn: []
    });

    constructor(protected queueService: QueueService, protected activatedRoute: ActivatedRoute, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ queue }) => {
            this.updateForm(queue);
        });
    }

    updateForm(queue: IQueue): void {
        this.editForm.patchValue({
            id: queue.id,
            itemsOnPage: queue.itemsOnPage,
            refreshInterval: queue.refreshInterval,
            selectedColumn: queue.selectedColumn,
            orderColumn: queue.orderColumn
        });
    }

    previousState(): void {
        window.history.back();
    }

    save(): void {
        this.isSaving = true;
        const queue = this.createFromForm();
        if (queue.id !== undefined) {
            this.subscribeToSaveResponse(this.queueService.update(queue));
        } else {
            this.subscribeToSaveResponse(this.queueService.create(queue));
        }
    }

    private createFromForm(): IQueue {
        return {
            ...new Queue(),
            id: this.editForm.get(['id'])!.value,
            itemsOnPage: this.editForm.get(['itemsOnPage'])!.value,
            refreshInterval: this.editForm.get(['refreshInterval'])!.value,
            selectedColumn: this.editForm.get(['selectedColumn'])!.value,
            orderColumn: this.editForm.get(['orderColumn'])!.value
        };
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IQueue>>): void {
        result.subscribe(
            () => this.onSaveSuccess(),
            () => this.onSaveError()
        );
    }

    protected onSaveSuccess(): void {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError(): void {
        this.isSaving = false;
    }
}
