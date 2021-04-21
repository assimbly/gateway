import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { ITopic, Topic } from 'app/shared/model/topic.model';
import { TopicService } from './topic.service';

@Component({
    selector: 'jhi-topic-update',
    templateUrl: './topic-update.component.html'
})
export class TopicUpdateComponent implements OnInit {
    isSaving = false;

    editForm = this.fb.group({
        id: [],
        itemsOnPage: [],
        refreshInterval: [],
        selectedColumn: [],
        orderColumn: []
    });

    constructor(protected topicService: TopicService, protected activatedRoute: ActivatedRoute, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ topic }) => {
            this.updateForm(topic);
        });
    }

    updateForm(topic: ITopic): void {
        this.editForm.patchValue({
            id: topic.id,
            itemsOnPage: topic.itemsOnPage,
            refreshInterval: topic.refreshInterval,
            selectedColumn: topic.selectedColumn,
            orderColumn: topic.orderColumn
        });
    }

    previousState(): void {
        window.history.back();
    }

    save(): void {
        this.isSaving = true;
        const topic = this.createFromForm();
        if (topic.id !== undefined) {
            this.subscribeToSaveResponse(this.topicService.update(topic));
        } else {
            this.subscribeToSaveResponse(this.topicService.create(topic));
        }
    }

    private createFromForm(): ITopic {
        return {
            ...new Topic(),
            id: this.editForm.get(['id'])!.value,
            itemsOnPage: this.editForm.get(['itemsOnPage'])!.value,
            refreshInterval: this.editForm.get(['refreshInterval'])!.value,
            selectedColumn: this.editForm.get(['selectedColumn'])!.value,
            orderColumn: this.editForm.get(['orderColumn'])!.value
        };
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<ITopic>>): void {
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
