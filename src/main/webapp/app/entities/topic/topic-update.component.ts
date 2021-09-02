import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { Address, IAddress } from 'app/shared/model/address.model';
import { TopicService } from './topic.service';
import { IBroker } from 'app/shared/model/broker.model';

@Component({
    selector: 'jhi-topic-update',
    templateUrl: './topic-update.component.html'
})
export class TopicUpdateComponent implements OnInit {
    isSaving = false;

    editForm = this.fb.group({
        address: [],
        name: [],
        numberOfConsumers: [],
        numberOfMessages: [],
        size: [],
        temporary: []
    });

    brokerType: string = '';
    brokers: IBroker[];

    constructor(protected topicService: TopicService, protected activatedRoute: ActivatedRoute, private fb: FormBuilder) {
        this.brokers = [];
    }

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ topic }) => {
            this.updateForm(topic);
        });
        this.getBrokerType();
    }

    updateForm(address: IAddress): void {
        this.editForm.patchValue({
            address: address.address,
            name: address.name,
            numberOfConsumers: address.numberOfConsumers,
            numberOfMessages: address.numberOfMessages,
            size: address.size,
            temporary: address.temporary
        });
    }

    previousState(): void {
        window.history.back();
    }

    save(): void {
        this.isSaving = true;
        const address = this.createFromForm();
        this.subscribeToSaveResponse(this.topicService.createTopic(address.name, this.brokerType));
    }

    private createFromForm(): IAddress {
        return {
            ...new Address(),
            address: this.editForm.get(['address'])!.value,
            name: this.editForm.get(['name'])!.value,
            numberOfConsumers: this.editForm.get(['numberOfConsumers'])!.value,
            numberOfMessages: this.editForm.get(['numberOfMessages'])!.value,
            size: this.editForm.get(['size'])!.value,
            temporary: this.editForm.get(['temporary'])!.value
        };
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<any>>): void {
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

    getBrokerType(): void {
        this.topicService.getBrokers().subscribe(
            data => {
                if (data) {
                    for (let broker of data.body) {
                        this.brokers.push(broker);
                        this.brokerType = broker.type;
                    }
                }
            },
            error => console.log(error)
        );
    }
}
