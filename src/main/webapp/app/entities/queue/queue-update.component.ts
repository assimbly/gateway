import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { IQueue, Queue } from 'app/shared/model/queue.model';
import { QueueService } from './queue.service';
import { Address, IAddress } from 'app/shared/model/address.model';
import { IBroker } from 'app/shared/model/broker.model';

@Component({
    selector: 'jhi-queue-update',
    templateUrl: './queue-update.component.html'
})
export class QueueUpdateComponent implements OnInit {
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

    constructor(protected queueService: QueueService, protected activatedRoute: ActivatedRoute, private fb: FormBuilder) {
        this.brokers = [];
    }

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ address }) => {
            this.updateForm(address);
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
        this.subscribeToSaveResponse(this.queueService.createQueue(address.name, this.brokerType));
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
        this.queueService.getBrokers().subscribe(
            data => {
                if (data) {
                    for (let i = 0; i < data.body.length; i++) {
                        this.brokers.push(data.body[i]);
                        this.brokerType = this.brokers[0].type;
                    }
                }
            },
            error => console.log(error)
        );
    }
}