import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
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
    isClose: boolean;

    editForm: FormGroup;

    namePopoverMessage: string;
    brokerType: string = '';
    brokers: IBroker[];

    constructor(
        protected topicService: TopicService,
        protected activatedRoute: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder
    ) {
        this.brokers = [];
    }

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ address }) => {
            this.initForm();
            if (address) {
                this.updateForm(address);
            }
        });
        this.getBrokerType();
        this.namePopoverMessage = 'Name of the topic. Use a comma-separated list to add multiple queues';
    }

    initForm() {
        this.editForm = this.formBuilder.group({
            address: new FormControl(''),
            name: new FormControl(''),
            numberOfConsumers: new FormControl(''),
            numberoftimes: new FormControl(''),
            numberOfMessages: new FormControl(''),
            size: new FormControl(''),
            temporary: new FormControl('')
        });
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

        const topicNames = address.name.split(',');

        if (topicNames) {
            for (let i = 0; i < topicNames.length; i++) {
                if (i === topicNames.length - 1) {
                    this.isClose = true;
                    const topic = topicNames[i].trim();
                    this.subscribeToSaveResponse(this.topicService.createTopic(topic, this.brokerType));
                } else {
                    this.isClose = false;
                    const topic = topicNames[i].trim();
                    this.subscribeToSaveResponse(this.topicService.createTopic(topic, this.brokerType));
                }
            }
        } else {
            this.isClose = true;
            this.subscribeToSaveResponse(this.topicService.createTopic(address.name, this.brokerType));
        }
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
        if (this.isClose) {
            this.isSaving = false;
            this.router.navigate(['/topic']);
        }
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
