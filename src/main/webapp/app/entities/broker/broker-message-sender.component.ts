import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Gateway } from 'app/shared/model/gateway.model';

import { GatewayService } from './../gateway';
import { BrokerService } from './../broker';

import { FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Components } from '../../shared/camel/component-type';

import * as moment from 'moment';

import 'brace';
import 'brace/mode/text';
import 'brace/theme/eclipse';

@Component({
    selector: 'jhi-broker-message-sender',
    templateUrl: './broker-message-sender.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BrokerMessageSenderComponent implements OnInit {
    brokerType: string;
    endpointName: string;
    endpointType: string;
    headers: FormArray;

    requestDestination: string;
    requestExchangePattern: string;
    requestNumberOfTimes: string;
    requestHeaders: string;
    requestBody: string;

    responseBody: string;
    responseEditorMode: string = 'text';

    active;
    disabled = true;

    isSending: boolean;
    isAlert = false;

    isSaving: boolean;
    savingFlowFailed = false;
    savingFlowFailedMessage = 'Saving failed (check logs)';
    savingFlowSuccess = false;
    savingFlowSuccessMessage = 'Flow successfully saved';
    finished = false;

    gateways: Gateway[];

    createRoute: number;
    predicate: any;
    reverse: any;

    destinationPopoverMessage: string;
    exchangePatternPopoverMessage: string;
    numberOfTimesPopoverMessage: string;

    messageSenderForm: FormGroup;
    invalidUriMessage: string;

    serviceType: Array<string> = [];

    modalRef: NgbModalRef | null;

    constructor(
        private eventManager: JhiEventManager,
        private gatewayService: GatewayService,
        private brokerService: BrokerService,
        private jhiAlertService: JhiAlertService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        public components: Components
    ) {}

    ngOnInit() {
        this.initializeForm();
        this.load();
        this.setPopoverMessages();

        this.finished = true;
    }

    load() {
        this.isSending = false;
        this.createRoute = 0;
        this.active = '0';

        this.headers = this.messageSenderForm.get('headers') as FormArray;

        this.setBrokerType();

        this.route.params.subscribe(params => {
            this.endpointType = params['endpointType'];
            this.endpointName = params['endpointName'];
            this.messageSenderForm.controls.destination.setValue(this.endpointName);
        });

        this.messageSenderForm.controls.exchangepattern.setValue('FireAndForget');
    }
    setPopoverMessages() {
        this.destinationPopoverMessage = `Name of the queue or topic`;
        this.exchangePatternPopoverMessage = `Fire and Forget (Send only) or Request and Reply (Send and wait for response)`;
        this.numberOfTimesPopoverMessage = `Number of messages send (1 by default). This setting is only for FireAndForget pattern`;
    }

    initializeForm() {
        this.messageSenderForm = this.formBuilder.group({
            id: new FormControl(''),
            destination: new FormControl(''),
            exchangepattern: new FormControl('FireAndForget'),
            numberoftimes: new FormControl('1'),
            requestbody: new FormControl(''),
            headers: new FormArray([this.initializeHeader()])
        });
    }

    initializeHeader(): FormGroup {
        return this.formBuilder.group({
            key: new FormControl(null),
            value: new FormControl(null)
        });
    }

    updateForm() {
        this.updateTemplateData();
    }

    updateTemplateData() {
        this.messageSenderForm.patchValue({
            name: '',
            destination: '',
            exchangePattern: '',
            numberoftimes: '',
            requestbody: ''
        });
    }

    addHeader() {
        this.headers = this.messageSenderForm.get('headers') as FormArray;
        this.headers.push(this.initializeHeader());
    }

    removeHeader(index) {
        this.headers = this.messageSenderForm.get('headers') as FormArray;
        this.headers.removeAt(index);
    }

    createHeader(): FormGroup {
        return this.initializeHeader();
    }

    cancel() {
        window.history.back();
    }

    send(close: boolean) {
        if (!this.messageSenderForm.valid) {
            this.isSending = false;
            return;
        }

        this.isSending = true;
        this.isAlert = true;

        this.setRequest();

        this.sendMessage(close);
    }

    setRequest() {
        this.headers = this.messageSenderForm.get('headers') as FormArray;

        this.requestDestination = this.messageSenderForm.controls.destination.value;
        this.requestExchangePattern =
            this.messageSenderForm.controls.exchangepattern.value == null
                ? 'FireAndForget'
                : this.messageSenderForm.controls.exchangepattern.value;
        this.requestNumberOfTimes =
            this.messageSenderForm.controls.numberoftimes.value == null ? 1 : this.messageSenderForm.controls.numberoftimes.value;
        this.requestBody = this.messageSenderForm.controls.requestbody.value;
        this.requestHeaders = this.formArrayToJson(this.headers);
    }

    sendMessage(close: boolean) {
        if (this.requestExchangePattern === 'FireAndForget') {
            this.brokerService.sendMessage('classic', this.requestDestination, this.requestHeaders, this.requestBody).subscribe(
                res => {
                    this.handleSendResponse(res.body, false);
                    if (close) {
                        window.history.back();
                    }
                },
                res => {
                    this.handleSendError(res.error);
                }
            );
        } else if (this.requestExchangePattern === 'RequestAndReply') {
            this.brokerService.sendMessage('classic', this.requestDestination, this.requestHeaders, this.requestBody).subscribe(
                res => {
                    this.handleSendResponse(res.body, true);
                },
                res => {
                    this.handleSendError(res.error);
                }
            );
        }
    }

    formArrayToJson(formArray: FormArray) {
        let json: any = {};

        formArray.controls.forEach((element, index) => {
            const key = element.get('key').value;
            const value = element.get('value').value;
            if (key) {
                json[key] = value;
            }
        });

        return JSON.stringify(json);
    }

    handleSendResponse(body: string, showResponse: boolean) {
        this.jhiAlertService.success('Send successfully', null, null);
        setTimeout(() => {
            this.isSending = false;
        }, 1000);
        if (showResponse) {
            this.setEditorMode(body);
            //this.responseBody = body;
            //this.active = '2';
        } else {
            //this.responseBody = body;
        }
    }

    handleSendError(body: any) {
        this.isSending = false;
        this.jhiAlertService.error('Send failed', null, null);
    }

    setVersion() {
        let now = moment();
    }

    setBrokerType() {
        this.brokerService.getBrokerType(1).subscribe(
            data => {
                if (data) {
                    this.brokerType = data.body;
                } else {
                    this.brokerType = 'classic';
                }
            },
            error => console.log(error)
        );
    }

    //Get currrent scroll position
    findPos(obj) {
        var curtop = 0;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while ((obj = obj.offsetParent));
            return curtop;
        }
    }

    goBack() {
        window.history.back();
    }

    setEditorMode(str: string) {
        if (str.startsWith('{') || str.startsWith('[')) {
            this.responseEditorMode = 'json';
        } else if (str.startsWith('<')) {
            this.responseEditorMode = 'xml';
        } else {
            this.responseEditorMode = 'text';
        }
    }

    allowDrop(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    drop(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        this.readFile(file);
    }

    readFile(file: File) {
        var reader = new FileReader();
        reader.onload = () => {
            this.requestBody = reader.result.toString();
        };
        reader.readAsText(file);
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
