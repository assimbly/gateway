import { Component, OnInit, AfterViewInit, AfterContentInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Gateway } from 'app/shared/model/gateway.model';
import { IMessage } from 'app/shared/model/messsage.model';
import { IBroker } from 'app/shared/model/broker.model';

import { GatewayService } from './../gateway';
import { BrokerService } from './../broker';

import { FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Components } from '../../shared/camel/component-type';

import * as moment from 'moment';

import * as ace from 'ace-builds';
import 'brace';
import 'brace/mode/text';
import 'brace/mode/json';
import 'brace/theme/eclipse';

@Component({
    selector: 'jhi-broker-message-sender',
    templateUrl: './broker-message-sender.component.html'
})
export class BrokerMessageSenderComponent implements OnInit {
    @ViewChild('editor', { read: ElementRef, static: false }) editor: ElementRef;

    messages: IMessage[];
    message: IMessage;

    brokers: IBroker[];
    brokerType: string;

    endpointName: string;
    endpointType: string;

    headers: FormArray;
    jmsHeaders: FormArray;

    requestDestination: string;
    requestExchangePattern: string;
    requestNumberOfTimes: string;
    requestHeaders: string;
    requestBody: string;

    responseBody: string;

    requestEditorMode: string = 'text';
    responseEditorMode: string = 'text';

    alert: string;
    numberOfMessages: number;
    numberOfSuccesfulMessages;
    number;
    numberOfFailedMessages: number;
    sendingMessages: string;
    successfulMessages: string;
    failedMessages: string;

    active;
    disabled = true;

    isSending: boolean;
    isSuccessful: boolean = false;
    isFailed: boolean = false;
    isAlert = false;
    isSaving: boolean;
    finished = false;

    gateways: Gateway[];

    createRoute: number;
    predicate: any;
    reverse: any;

    destinationPopoverMessage: string;
    exchangePatternPopoverMessage: string;
    numberOfTimesPopoverMessage: string;

    messageSenderForm: FormGroup;

    messageFromFile = false;

    serviceType: Array<string> = [];
    upload: any;
    fileName: string;
    subtitle: string;
    dateTime: string;

    modalRef: NgbModalRef | null;

    constructor(
        private eventManager: JhiEventManager,
        private gatewayService: GatewayService,
        private brokerService: BrokerService,
        private jhiAlertService: JhiAlertService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        public components: Components,
        private element: ElementRef
    ) {}

    ngOnInit() {
        this.initializeForm();
        this.load();
        this.setBrokerType();
        this.setPopoverMessages();

        this.finished = true;
    }

    public ngAfterViewInit(): void {
        this.editor.nativeElement.focus();
        const aceEditor = ace.edit(this.editor.nativeElement);
        aceEditor.focus();
        aceEditor.moveCursorTo(1, 1);
    }

    load() {
        this.isSending = false;
        this.createRoute = 0;
        this.active = '0';

        this.headers = this.messageSenderForm.get('headers') as FormArray;

        this.route.params.subscribe(params => {
            this.endpointType = params['endpointType'];
            this.endpointName = params['endpointName'];
            this.brokerType = params['brokerType'];
            this.messageSenderForm.controls.destination.setValue(this.endpointName);
        });

        this.subtitle = 'Sending to ' + this.endpointType + ' ' + this.endpointName;

        this.messageSenderForm.controls.exchangepattern.setValue('FireAndForget');
    }

    initializeForm() {
        this.messageSenderForm = this.formBuilder.group({
            id: new FormControl(''),
            destination: new FormControl(''),
            exchangepattern: new FormControl('FireAndForget'),
            numberoftimes: new FormControl('1'),
            requestbody: new FormControl(''),
            headers: new FormArray([this.initializeHeader(null, null)]),
            jmsHeaders: new FormArray([this.initializeHeader(null, null)])
        });
    }

    initializeHeader(keyVal, valueVal): FormGroup {
        return this.formBuilder.group({
            key: new FormControl(keyVal),
            value: new FormControl(valueVal)
        });
    }

    initializeJmsHeader(keyVal, valueVal): FormGroup {
        return this.formBuilder.group({
            key: new FormControl(keyVal),
            value: new FormControl(valueVal)
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

    addHeader(headerType: string) {
        this.headers = this.messageSenderForm.get(headerType) as FormArray;
        this.headers.push(this.initializeHeader(null, null));
    }

    removeHeader(headerType: string, index) {
        this.headers = this.messageSenderForm.get(headerType) as FormArray;
        if (index === 0) {
            this.headers
                .at(index)
                .get('key')
                .patchValue('');
            this.headers
                .at(index)
                .get('value')
                .patchValue('');
        } else {
            this.headers.removeAt(index);
        }
    }

    createHeader(): FormGroup {
        return this.initializeHeader(null, null);
    }

    setPopoverMessages() {
        this.destinationPopoverMessage = `Name of the queue or topic`;
        this.exchangePatternPopoverMessage = `Fire and Forget (Send only) or Request and Reply (Send and wait for response)`;
        this.numberOfTimesPopoverMessage = `Number of messages send (1 by default). This setting is only for FireAndForget pattern`;
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
        this.isSending = true;
        this.isFailed = false;
        this.isSuccessful = false;
        this.numberOfMessages = 1;
        this.numberOfSuccesfulMessages = 0;
        this.numberOfFailedMessages = 0;

        if (this.messages && this.messages.length > 1) {
            for (var i = 0; i < this.messages.length; i++) {
                this.numberOfMessages = this.messages.length;
                this.sendingMessages = i + 1 + ' of ' + this.numberOfMessages;
                this.setRequestFromArray(this.messages[i]);
                this.sendMessage(close);
            }
        } else {
            this.sendingMessages = '1 of ' + this.numberOfMessages;
            this.setRequestFromForm();
            this.sendMessage(close);
        }
    }

    setRequestFromForm() {
        this.headers = this.messageSenderForm.get('headers') as FormArray;
        this.jmsHeaders = this.messageSenderForm.get('jmsHeaders') as FormArray;
        this.requestDestination = this.messageSenderForm.controls.destination.value;
        this.requestExchangePattern =
            this.messageSenderForm.controls.exchangepattern.value == null
                ? 'FireAndForget'
                : this.messageSenderForm.controls.exchangepattern.value;
        this.requestNumberOfTimes =
            this.messageSenderForm.controls.numberoftimes.value == null ? 1 : this.messageSenderForm.controls.numberoftimes.value;
        this.requestBody = this.messageSenderForm.controls.requestbody.value;

        if (!this.requestBody) {
            this.requestBody = ' ';
        }

        const headersJson = this.formArrayToJson(this.headers);
        const jmsHeadersJson = this.formArrayToJson(this.jmsHeaders);

        const allHeadersJson = {
            ...headersJson,
            ...jmsHeadersJson
        };

        this.requestHeaders = JSON.stringify(allHeadersJson);
    }

    setRequestFromArray(message: IMessage) {
        let allHeadersJson = {};

        if (this.messageFromFile) {
            this.headers = message.headers == null ? {} : message.headers;
            this.jmsHeaders = message.jmsHeaders == null ? {} : message.jmsHeaders;

            allHeadersJson = {
                ...this.headers,
                ...this.jmsHeaders
            };
        } else {
            this.headers = this.messageSenderForm.get('headers') as FormArray;
            this.jmsHeaders = this.messageSenderForm.get('jmsHeaders') as FormArray;

            const headersJson = this.formArrayToJson(this.headers);
            const jmsHeadersJson = this.formArrayToJson(this.jmsHeaders);

            allHeadersJson = {
                ...headersJson,
                ...jmsHeadersJson
            };
        }

        this.requestDestination = this.messageSenderForm.controls.destination.value;

        this.requestExchangePattern =
            this.messageSenderForm.controls.exchangepattern.value == null
                ? 'FireAndForget'
                : this.messageSenderForm.controls.exchangepattern.value;
        this.requestNumberOfTimes =
            this.messageSenderForm.controls.numberoftimes.value == null ? 1 : this.messageSenderForm.controls.numberoftimes.value;
        this.requestBody = message.body == null ? ' ' : message.body;

        this.requestHeaders = JSON.stringify(allHeadersJson);
    }

    sendMessage(close: boolean) {
        if (this.requestExchangePattern === 'FireAndForget') {
            this.brokerService.sendMessage(this.brokerType, this.requestDestination, this.requestHeaders, this.requestBody).subscribe(
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
            this.brokerService.sendMessage(this.brokerType, this.requestDestination, this.requestHeaders, this.requestBody).subscribe(
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

        return json;
    }

    handleSendResponse(body: string, showResponse: boolean) {
        let now = moment();
        this.dateTime = new Date().toLocaleString();

        this.isSuccessful = true;
        this.numberOfSuccesfulMessages = this.numberOfSuccesfulMessages + 1;
        this.successfulMessages =
            ' | Messages: ' + this.numberOfSuccesfulMessages + ' of ' + this.numberOfMessages + ' | Last time: ' + this.dateTime;
        this.isSending = false;

        /* uncomment when using responses
        if (showResponse) {
            this.setEditorMode(body);
            //this.responseBody = body;
            //this.active = '2';
        } else {
            //this.responseBody = body;
        }*/
    }

    handleSendError(body: any) {
        this.dateTime = new Date().toLocaleString();
        this.isSending = false;
        this.isFailed = true;
        this.numberOfFailedMessages = this.numberOfFailedMessages + 1;
        this.failedMessages =
            ' | Messages: ' + this.numberOfFailedMessages + ' of ' + this.numberOfMessages + ' | Last time: ' + this.dateTime;
    }

    setVersion() {
        let now = moment();
    }

    setBrokerType() {
        if (!this.brokerType) {
            this.brokerService.getBrokers().subscribe(
                data => {
                    if (data) {
                        for (let i = 0; i < data.body.length; i++) {
                            this.brokers.push(data.body[i]);
                        }
                        this.brokerType = this.brokers[0].type;
                        if (this.brokerType == null) {
                            console.log('Unknown broker: set brokertype to artemis');
                            this.brokerType = 'artemis';
                        }
                    }
                },
                error => console.log(error)
            );
        }
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

    onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }

    openFile(event) {
        const reader = new FileReader();

        reader.onload = () => {
            this.upload = reader.result;
            this.setUploadMessages();
        };

        reader.readAsBinaryString(event.target.files[0]);
        this.fileName = event.target.files[0].name;
    }

    openDirectory(event) {
        this.messages = [];
        this.messageFromFile = false;

        for (var i = 0; i < event.target.files.length; i++) {
            let reader = new FileReader();

            reader.onload = () => {
                this.message = {};
                this.message.body = reader.result.toString();
                this.messages.push(this.message);
            };
            reader.readAsBinaryString(event.target.files[i]);
        }

        this.messageSenderForm.controls.requestbody.setValue('Uploaded ' + event.target.files.length + ' files from directory');
    }

    setUploadMessages() {
        //reset the form
        this.initializeForm();
        this.load();

        this.messageFromFile = true;

        //set the uploaded messages
        try {
            //try to parse via json
            let data = JSON.parse(this.upload);

            if (data.messages.message) {
                if (data.messages.message.length === 1) {
                    const body = data.messages.message[0].body;
                    const headers = data.messages.message[0].headers;
                    const jmsHeaders = data.messages.message[0].jmsHeaders;

                    this.messageSenderForm.controls.requestbody.setValue(body);
                    this.requestEditorMode = this.getFileType(body);

                    for (var key in headers) {
                        if (headers.hasOwnProperty(key)) {
                            this.headers = this.messageSenderForm.get('headers') as FormArray;
                            this.headers.push(this.initializeHeader(key, headers[key]));
                        }
                    }

                    if (Object.keys(headers).length > 0) {
                        this.removeHeader('headers', 0);
                    }

                    for (var key in jmsHeaders) {
                        if (jmsHeaders.hasOwnProperty(key)) {
                            this.headers = this.messageSenderForm.get('jmsHeaders') as FormArray;
                            this.headers.push(this.initializeHeader(key, jmsHeaders[key]));
                        }
                    }

                    if (Object.keys(jmsHeaders).length) {
                        this.removeHeader('jmsHeaders', 0);
                    }
                } else {
                    this.messages = [];

                    for (var i = 0; i < data.messages.message.length; i++) {
                        this.message = {};

                        this.message.headers = data.messages.message[i].headers;
                        this.message.body = data.messages.message[i].body;

                        this.messages.push(this.message);
                    }

                    this.messageSenderForm.controls.requestbody.setValue(
                        'Uploaded file ' + this.fileName + ' with ' + data.messages.message.length + ' messages'
                    );
                }
            } else {
                this.requestEditorMode = 'json';
                this.messageSenderForm.controls.requestbody.setValue(this.upload);
            }
        } catch (e) {
            this.messageSenderForm.controls.requestbody.setValue(this.upload);
            this.requestEditorMode = this.getFileType(this.upload);
        }
    }

    getFileType(doc) {
        try {
            //try to parse via json
            let a = JSON.parse(doc);
            return 'json';
        } catch (e) {
            try {
                //try xml parsing
                let parser = new DOMParser();
                var xmlDoc = parser.parseFromString(doc, 'application/xml');
                if (xmlDoc.documentElement.nodeName == '' || xmlDoc.documentElement.nodeName == 'parsererror') return 'txt';
                else return 'xml';
            } catch (e) {
                return 'txt';
            }
        }
    }
}
