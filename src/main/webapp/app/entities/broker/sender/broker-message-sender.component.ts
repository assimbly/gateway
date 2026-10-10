import { Component, ElementRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, timeout } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { IBroker } from 'app/shared/model/broker.model';
import { IAddress } from 'app/shared/model/address.model';
import { BrokerService } from 'app/entities/broker/broker.service';
import { QueueService } from 'app/entities/queue/queue.service';
import { TopicService } from 'app/entities/topic/topic.service';

import SendMessageEditor from 'app/shared/send/send-message-editor';
import SendResultPanel from 'app/shared/send/send-result';
import SendToolbar from 'app/shared/send/send-toolbar';
import { focusFirstInvalid } from 'app/shared/send/send-form';
import { SendHeader, headersToJson } from 'app/shared/send/send-headers';
import { SEND_TIMEOUT_MS, SendState } from 'app/shared/send/send-state';
import { BodyMode, SendMessage, UploadedMessages } from 'app/shared/send/send-upload';

/** The JMS headers that used to have their own tab. They are suggestions for the name of a header now. */
export const JMS_HEADER_NAMES = ['JMSCorrelationID', 'JMSReplyTo', 'JMSType'];

@Component({
    selector: 'jhi-broker-message-sender',
    templateUrl: './broker-message-sender.component.html',
    imports: [CommonModule, ReactiveFormsModule, NgSelectModule, SendToolbar, SendResultPanel, SendMessageEditor],
    host: {
        '(document:keydown.control.enter)': 'send()',
        '(document:keydown.meta.enter)': 'send()',
    },
})
export class BrokerMessageSenderComponent implements OnInit, OnDestroy {
    private readonly element = inject(ElementRef<HTMLElement>);
    private readonly brokerService = inject(BrokerService);
    private readonly queueService = inject(QueueService);
    private readonly topicService = inject(TopicService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);

    readonly jmsHeaderNames = JMS_HEADER_NAMES;
    readonly state = new SendState();

    // the message
    readonly body = signal('');
    readonly bodyMode = signal<BodyMode>('text');
    readonly headers = signal<SendHeader[]>([]);

    brokerType: string;
    brokers: IBroker[] = [];

    endpointName: string;
    endpointType: string;

    // names of the existing queues or topics, offered as suggestions for the destination
    suggestions: string[] = [];
    // the options of the endpoint select: the suggestions plus the name that is currently filled in
    endpointOptions: string[] = [];
    loadingSuggestions = false;

    // true when the page was opened from an endpoint row (query params), false when opened from the sidebar
    openedFromEndpoint = false;

    messageSenderForm: FormGroup;
    finished = false;

    private readonly uploaded = new UploadedMessages(this.body, this.bodyMode, this.headers);
    private destroyed = false;

    get isSending(): boolean {
        return this.state.sending();
    }

    ngOnInit() {
        this.initializeForm();
        this.applyQueryParams();
        this.setBrokerType();
        this.finished = true;
    }

    ngOnDestroy() {
        this.destroyed = true;
    }

    initializeForm() {
        this.messageSenderForm = this.formBuilder.group({
            destination: new FormControl('', Validators.required),
            endpointType: new FormControl('queue'),
        });
    }

    /** Pre-fills the destination when the page is opened from an endpoint row (Endpoints list). */
    applyQueryParams() {
        this.route.queryParams.subscribe(params => {
            this.openedFromEndpoint = !!params['endpointName'];
            this.endpointName = params['endpointName'];
            this.endpointType = params['endpointType'] === 'topic' ? 'topic' : 'queue';
            this.brokerType = params['brokerType'] ?? this.brokerType;

            this.messageSenderForm.controls.destination.setValue(this.endpointName ?? '');
            this.messageSenderForm.controls.endpointType.setValue(this.endpointType);
            this.updateEndpointOptions();
        });
    }

    get selectedEndpointType(): string {
        return this.messageSenderForm.controls.endpointType.value === 'topic' ? 'topic' : 'queue';
    }

    get subtitle(): string {
        const name = this.messageSenderForm?.controls.destination.value;
        return name ? 'To ' + this.selectedEndpointType + ' ' + name : 'Choose a queue or topic to send to';
    }

    setEndpointType(type: string) {
        if (this.selectedEndpointType === type) {
            return;
        }
        this.messageSenderForm.controls.endpointType.setValue(type);
        this.suggestions = [];
        this.updateEndpointOptions();
        this.loadSuggestions();
    }

    /** Loads the names of the existing queues or topics (depending on the selected type) as suggestions. */
    loadSuggestions() {
        if (!this.brokerType) {
            return;
        }

        const type = this.selectedEndpointType;
        const addresses$ =
            type === 'topic'
                ? this.topicService.getAllTopics(this.brokerType).pipe(map(res => res.body?.topics?.topic ?? []))
                : this.queueService.getAllQueues(this.brokerType).pipe(map(res => res.body?.queues?.queue ?? []));

        this.loadingSuggestions = true;
        addresses$.subscribe(
            (addresses: IAddress[]) => {
                // ignore the response if the user switched type in the meantime
                if (type !== this.selectedEndpointType) {
                    return;
                }
                this.loadingSuggestions = false;
                this.suggestions = addresses
                    .filter(address => address.temporary?.toString() !== 'true' && !!address.name)
                    .map(address => address.name)
                    .sort();
                this.updateEndpointOptions();
            },
            () => {
                // suggestions are optional: the user can still type a name
                this.loadingSuggestions = false;
                this.suggestions = [];
                this.updateEndpointOptions();
            }
        );
    }

    /** The select must always contain the name that is filled in, also when it is not (yet) an existing endpoint. */
    updateEndpointOptions() {
        const current = this.messageSenderForm.controls.destination.value;
        this.endpointOptions = current && !this.suggestions.includes(current) ? [current, ...this.suggestions] : [...this.suggestions];
    }

    send() {
        if (this.destroyed || this.state.sending()) {
            return;
        }
        if (!this.messageSenderForm.valid) {
            this.messageSenderForm.markAllAsTouched();
            focusFirstInvalid(this.element.nativeElement);
            return;
        }

        // remember where the message goes: the user may change the form while the answer is pending
        const destination: string = this.messageSenderForm.controls.destination.value;
        const endpointType = this.selectedEndpointType;
        const messages = this.uploaded.messagesToSend();

        this.state.start(messages.length, endpointType + ' ' + destination);
        messages.forEach(message => this.sendMessage(destination, endpointType, message));
    }

    private sendMessage(destination: string, endpointType: string, message: SendMessage) {
        // the headers of the page apply to every message, the headers of an uploaded message override them
        const headers = JSON.stringify(headersToJson([...this.headers(), ...message.headers]));

        this.brokerService
            .sendMessage(this.brokerType, destination, headers, message.body || ' ', endpointType)
            .pipe(timeout(SEND_TIMEOUT_MS))
            .subscribe({
                next: () => this.state.succeed(),
                error: error => this.state.fail(error),
            });
    }

    setBrokerType() {
        if (this.brokerType) {
            this.loadSuggestions();
            return;
        }

        this.brokerService.getBrokers().subscribe(
            data => {
                if (data) {
                    this.brokers = data.body ?? [];
                    this.brokerType = this.brokers[0]?.type;
                    if (this.brokerType == null) {
                        this.brokerType = 'artemis';
                    }
                    this.loadSuggestions();
                }
            },
            error => console.log(error)
        );
    }

    goBack() {
        window.history.back();
    }

    async onFile(file: File) {
        this.state.reset();
        await this.uploaded.addFile(file);
    }
}
