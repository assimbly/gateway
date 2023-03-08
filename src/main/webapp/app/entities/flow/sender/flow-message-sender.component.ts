import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Gateway } from 'app/shared/model/gateway.model';
import { Flow, IFlow } from 'app/shared/model/flow.model';
import { FlowService } from '../flow.service';

import { Option, TypeLinks } from '../editor/flow-editor.component';

import { Step, StepType, IStep } from 'app/shared/model/step.model';
import { Connection } from 'app/shared/model/connection.model';
import { IHeader } from 'app/shared/model/header.model';

import { StepService } from '../../step/step.service';
import { ConnectionService } from '../../connection/connection.service';
import { HeaderService } from 'app/entities/header/header.service';
import { GatewayService } from '../../gateway/gateway.service';

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Components } from 'app/shared/camel/component-type';
import { Connections } from 'app/shared/camel/connections';

import { map } from 'rxjs/operators';

import { HeaderDialogComponent } from 'app/entities/header/header-dialog.component';
import { ConnectionDialogComponent } from 'app/entities/connection/connection-dialog.component';

import { HeaderPopupService } from 'app/entities/header/header-popup.service';
import { ConnectionPopupService } from 'app/entities/connection/connection-popup.service';

import dayjs from 'dayjs/esm';

@Component({
    selector: 'jhi-flow-message-sender',
    templateUrl: './flow-message-sender.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FlowMessageSenderComponent implements OnInit, OnDestroy {
    flows: IFlow[];
    connections: Connection[];
    headers: IHeader[];

    stepsOptions: Array<Array<Option>> = [[]];
    steps: IStep[] = new Array<Step>();
    URIList: IStep[] = new Array<Step>();

    step: IStep;
    requestStep: IStep;
    selectedSendStep: IStep;

    requestExchangePattern: string;
    requestNumberOfTimes: string;
    requestComponentType: string;
    requestUri: string;
    requestStepId: string;
    requestOptions: string;
    requestConnectionId: string;
    requestHeaderId: string;
    requestConnectionKeys: string;
    requestHeaderKeys: string;
    requestBody: string;

    responseBody: string;
    responseEditorMode = 'text';

    panelCollapsed: any = 'uno';
    public isCollapsed = true;
    active;
    disabled = true;
    activeStep: any;

    isSending: boolean;
    isAlert = false;

    isSaving: boolean;
    savingFlowFailed = false;
    savingFlowFailedMessage = 'Saving failed (check logs)';
    savingFlowSuccess = false;
    savingFlowSuccessMessage = 'Flow successfully saved';
    finished = false;

    gateways: Gateway[];

    embeddedBroker = false;
    createRoute: number;
    newId: number;
    predicate: any;
    queryCount: any;
    reverse: any;
    totalItems: number;
    connectionCreated: boolean;
    headerCreated: boolean;

    namePopoverMessage: string;
    stepPopoverMessage: string;
    exchangePatternPopoverMessage: string;
    numberOfTimesPopoverMessage: string;

    componentPopoverMessage: string;
    optionsPopoverMessage: string;
    headerPopoverMessage: string;
    connectionPopoverMessage: string;
    popoverMessage: string;

    selectedOption: Array<any> = [];
    componentOptions: Array<any> = [];

    consumerComponentsNames: Array<any> = [];
    producerComponentsNames: Array<any> = [];

    componentTypeAssimblyLinks: Array<string> = new Array<string>();
    componentTypeCamelLinks: Array<string> = new Array<string>();
    uriPlaceholders: Array<string> = new Array<string>();
    uriPopoverMessages: Array<string> = new Array<string>();

    typesLinks: Array<TypeLinks>;
    messageSenderForm: FormGroup;
    invalidUriMessage: string;

    testConnectionForm: FormGroup;
    testConnectionMessage: string;
    connectionHost: any;
    connectionPort: any;
    connectionTimeout: any;
    hostnamePopoverMessage: string;
    portPopoverMessage: string;
    timeoutPopoverMessage: string;

    filterConnection: Array<Array<Connection>> = [[]];
    connectionType: Array<string> = [];
    selectedConnection: Connection = new Connection();
    closeResult: string;

    private subscription: Subscription;
    private eventSubscriber: Subscription;
    private wikiDocUrl: string;
    private camelDocUrl: string;

    modalRef: NgbModalRef | null;

    constructor(
        private eventManager: EventManager,
        private gatewayService: GatewayService,
        private flowService: FlowService,
        private stepService: StepService,
        private connectionService: ConnectionService,
        private headerService: HeaderService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router,
        public components: Components,
        public connectionsList: Connections,
        private modalService: NgbModal,
        private headerPopupService: HeaderPopupService,
        private connectionPopupService: ConnectionPopupService
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.createRoute = 0;
        this.setPopoverMessages();

        this.setComponents();

        this.subscription = this.route.params.subscribe(params => {
            this.load();
        });

        this.registerChangeInFlows();
    }

    load() {
        forkJoin(
            this.flowService.getWikiDocUrl(),
            this.flowService.getCamelDocUrl(),
            this.connectionService.getAllConnections(),
            this.headerService.getAllHeaders(),
            this.stepService.query()
        ).subscribe(([wikiDocUrl, camelDocUrl, connections, headers, steps]) => {
            this.wikiDocUrl = wikiDocUrl.body;

            this.camelDocUrl = camelDocUrl.body;

            this.steps = steps.body;

            this.connections = connections.body;
            this.connectionCreated = this.connections.length > 0;

            this.headers = headers.body;
            this.headerCreated = this.headers.length > 0;

            this.initializeForm();

            this.messageSenderForm.controls.exchangepattern.setValue('FireAndForget');
            this.messageSenderForm.controls.templatefilter.setValue('ALL');

            this.requestStep = new Step();
            this.requestStep.stepType = StepType.TO;
            this.requestStep.componentType = 'file';
            this.requestComponentType = 'file';

            (<FormArray>this.messageSenderForm.controls.stepsData).push(this.initializeStepData(this.requestStep));

            this.stepsOptions[0] = [new Option()];

            this.setTypeLinks(this.requestStep, 0);

            this.finished = true;
        });
    }

    // this filters connections not of the correct type
    filterConnections(step: any, formService: FormControl) {
        this.connectionType[0] = this.connectionsList.getConnectionType(step.componentType);
        this.filterConnection[0] = this.connections.filter(f => f.type === this.connectionType[0]);
        if (this.filterConnection[0].length > 0 && step.connectionId) {
            formService.setValue(this.filterConnection[0].find(fs => fs.id === step.connectionId).id);
        }
    }

    setComponents() {
        const producerComponents = this.components.types.filter(function(component) {
            return component.consumerOnly === false;
        });

        const consumerComponents = this.components.types.filter(function(component) {
            return component.producerOnly === false;
        });

        this.producerComponentsNames = producerComponents.map(component => component.name);
        this.producerComponentsNames.sort();

        this.consumerComponentsNames = consumerComponents.map(component => component.name);
        this.consumerComponentsNames.sort();
    }

    setTypeLinks(step: any, stepFormIndex?, e?: Event) {
        const stepForm = <FormGroup>(<FormArray>this.messageSenderForm.controls.stepsData).controls[stepFormIndex];

        if (typeof e !== 'undefined') {
            step.componentType = e;
            this.requestComponentType = step.componentType;
        } else {
            step.componentType = 'file';
            this.requestComponentType = 'file';
        }

        let type;
        let camelType;
        let componentType;
        let camelComponentType;

        componentType = step.componentType.toLowerCase();

        camelComponentType = this.components.getCamelComponentType(componentType);

        type = this.components.types.find(x => x.name === step.componentType.toString());
        camelType = this.components.types.find(x => x.name === camelComponentType.toUpperCase());

        stepForm.controls.componentType.patchValue(step.componentType);
        stepForm.controls.connection.setValue('');
        this.filterConnections(step, stepForm.controls.connection as FormControl);

        this.componentTypeAssimblyLinks[stepFormIndex] = this.wikiDocUrl + '/component-' + componentType;
        this.componentTypeCamelLinks[stepFormIndex] = this.camelDocUrl + '/' + camelComponentType + '-component.html';

        this.uriPlaceholders[stepFormIndex] = type.syntax;
        this.uriPopoverMessages[stepFormIndex] = type.description;

        // set options keys
        this.getComponentOptions(camelComponentType).subscribe(data => {
            const componentOptions = data.properties;

            this.componentOptions[0] = Object.keys(componentOptions).map(key => ({ ...componentOptions[key], ...{ name: key } }));
            this.componentOptions[0].sort(function(a, b) {
                return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
            });
        });

        this.enableFields(stepForm);

        this.setURIlist();
    }

    setPopoverMessages() {
        this.namePopoverMessage = `Name of the flow. Usually the name of the message type like <i>order</i>.<br/><br>Displayed on the <i>flows</i> page.`;
        this.stepPopoverMessage = `The uris that can be selected in the request`;
        this.exchangePatternPopoverMessage = `Fire and Forget (InOnly) or Request and Reply (InOut)`;
        this.numberOfTimesPopoverMessage = `Number of messages send (1 by default). This setting is only for FireAndForget pattern`;
        this.componentPopoverMessage = `The Apache Camel scheme to use. Click on the Apache Camel or Assimbly button for online documentation on the selected scheme.`;
        this.optionsPopoverMessage = `Options for the selected component. You can add one or more key/value pairs.<br/><br/>
                                     Click on the Apache Camel button to view documation on the valid options.`;
        this.headerPopoverMessage = `A group of key/value pairs to add to the message header.<br/><br/> Use the button on the right to create or edit a header.`;
        this.connectionPopoverMessage = `If available then a connection can be selected. For example a connection that sets up a database connection.<br/><br/>
                                     Use the button on the right to create or edit connections.`;
        this.popoverMessage = `Destination`;
        this.hostnamePopoverMessage = `URL, IP-address or DNS Name. For example camel.apache.org or 127.0.0.1`;
        this.portPopoverMessage = `Number of the port. Range between 1 and 65536`;
        this.timeoutPopoverMessage = `Timeout in seconds to wait for connection.`;
    }

    enableFields(stepForm) {
        const componentHasConnection = this.connectionsList.getConnectionType(stepForm.controls.componentType.value);

        if (stepForm.controls.componentType.value === 'wastebin') {
            stepForm.controls.uri.disable();
            stepForm.controls.options.disable();
            stepForm.controls.connection.disable();
            stepForm.controls.header.disable();
        } else if (componentHasConnection) {
            stepForm.controls.uri.enable();
            stepForm.controls.options.enable();
            stepForm.controls.header.enable();
            stepForm.controls.connection.enable();
        } else {
            stepForm.controls.uri.enable();
            stepForm.controls.options.enable();
            stepForm.controls.header.enable();
            stepForm.controls.connection.disable();
        }
    }

    setURIlist() {
        this.URIList = [];

        const tStepsUnique = this.steps.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

        tStepsUnique.forEach((step, i) => {
            if (this.requestComponentType === step.componentType.toLowerCase()) {
                this.URIList.push(step);
            }
        });
    }

    initializeForm() {
        this.messageSenderForm = new FormGroup({
            id: new FormControl(''),
            name: new FormControl(''),
            templatefilter: new FormControl('from'),
            exchangepattern: new FormControl('FireAndForget'),
            numberoftimes: new FormControl('1'),
            stepsData: new FormArray([]),
			responsebody: new FormControl('')
        });
    }

    initializeStepData(step: Step): FormGroup {
        return new FormGroup({
            id: new FormControl(step.id),
            componentType: new FormControl(step.componentType, Validators.required),
            uri: new FormControl(step.uri),
            options: new FormArray([this.initializeOption()]),
            header: new FormControl(step.headerId),
            connection: new FormControl(step.connectionId, Validators.required),
            requestbody: new FormControl('')
        });
    }

    initializeOption(): FormGroup {
        return new FormGroup({
            key: new FormControl(null),
            value: new FormControl(null),
            defaultValue: new FormControl('')
        });
    }

    initializeTestConnectionForm() {
        this.testConnectionForm = new FormGroup({
            connectionHost: new FormControl(null, Validators.required),
            connectionPort: new FormControl(80),
            connectionTimeout: new FormControl(10)
        });
    }

    updateForm() {
        this.updateTemplateData();
        const stepsData = this.messageSenderForm.controls.stepsData as FormArray;
        this.steps.forEach((step, i) => {
            this.updateStepData(step, stepsData.controls[i] as FormControl);
        });
    }

    updateTemplateData() {
        this.messageSenderForm.patchValue({
            name: '',
            exchangePattern: '',
            numberoftimes: ''
        });
    }

    updateStepData(step: any, stepData: FormControl) {
        stepData.patchValue({
            id: step.id,
            stepType: step.stepType,
            componentType: step.componentType,
            uri: step.uri,
            connection: step.connectionId,
            header: step.headerId
        });
    }

    getComponentOptions(componentType: String): any {
        return this.flowService.getComponentOptions(1, componentType).pipe(
            map(options => {
                return options.body;
            })
        );
    }

    getOptions(step: any, stepForm: any, stepOptions: Array<Option>) {
        if (!step.options) {
            step.options = '';
        }

        const options = step.options.split('&');

        options.forEach((option, index) => {
            const o = new Option();

            if (typeof stepForm.controls.options.controls[index] === 'undefined') {
                stepForm.controls.options.push(this.initializeOption());
            }

            if (option.includes('=')) {
                o.key = option.split('=')[0];
                o.value = option
                    .split('=')
                    .slice(1)
                    .join('=');
            } else {
                o.key = null;
                o.value = null;
            }

            stepForm.controls.options.controls[index].patchValue({
                key: o.key,
                value: o.value
            });

            stepOptions.push(o);
        });
    }

    setOptions() {
        this.steps.forEach((step, i) => {
            step.options = '';
            this.setStepOptions(this.stepsOptions[i], step, this.selectOptions(i));
        });
    }

    setStepOptions(stepOptions: Array<Option>, step, formOptions: FormArray) {
        let index = 0;

        stepOptions.forEach((option, i) => {
            option.key = (<FormGroup>formOptions.controls[i]).controls.key.value;
            option.value = (<FormGroup>formOptions.controls[i]).controls.value.value;

            if (option.key && option.value) {
                this.requestOptions += index > 0 ? `&${option.key}=${option.value}` : `${option.key}=${option.value}`;
                index++;
            }

        });
    }

    addOption(options: Array<Option>, stepIndex) {
        this.selectOptions(stepIndex).push(this.initializeOption());
        options.push(new Option());
    }

    removeOption(options: Array<Option>, option: Option, stepIndex) {
        const index = options.indexOf(option);
        const formOptions = this.selectOptions(stepIndex);
        formOptions.removeAt(index);
        options.splice(index, 1);
    }

    validateOptions(option: FormGroup) {
        if (option.value.key || option.value.value) {
            option.controls.key.setValidators([Validators.required]);
            option.controls.value.setValidators([Validators.required]);
        } else {
            option.controls.key.clearValidators();
            option.controls.value.clearValidators();
        }
        option.controls.key.updateValueAndValidity();
        option.controls.value.updateValueAndValidity();
    }

    selectOptions(stepIndex): FormArray {
        const stepData = (<FormArray>this.messageSenderForm.controls.stepsData).controls[stepIndex];
        return <FormArray>(<FormGroup>stepData).controls.options;
    }

    changeOptionSelection(selectedOption, index, optionIndex) {
        const componentOption = this.componentOptions[index].filter(option => option.name === selectedOption);
        const defaultValue = componentOption[0].defaultValue;

        const stepData = (<FormArray>this.messageSenderForm.controls.stepsData).controls[0];
        const formOptions = <FormArray>(<FormGroup>stepData).controls.options;

        if (defaultValue) {
            (<FormGroup>formOptions.controls[optionIndex]).controls.defaultValue.patchValue('Default Value: ' + defaultValue);
        } else {
            (<FormGroup>formOptions.controls[optionIndex]).controls.defaultValue.patchValue('');
        }
    }

    openModal(templateRef: TemplateRef<any>) {
        this.modalRef = this.modalService.open(templateRef);
    }

    openTestConnectionModal(templateRef: TemplateRef<any>) {
        this.initializeTestConnectionForm();
        this.testConnectionMessage = '';
        this.modalRef = this.modalService.open(templateRef);
    }

    cancelModal(): void {
        if (this.modalRef) {
            this.modalRef.dismiss();
            this.modalRef = null;
        }
    }

    testConnection() {
        this.testConnectionMessage = '<i class="fa fa-refresh fa-spin fa-fw"></i><span class="sr-only"></span>Testing...';
        this.connectionHost = <FormGroup>this.testConnectionForm.controls.connectionHost.value;
        this.connectionPort = <FormGroup>this.testConnectionForm.controls.connectionPort.value;
        this.connectionTimeout = <FormGroup>this.testConnectionForm.controls.connectionTimeout.value;

        this.flowService.testConnection(1, this.connectionHost, this.connectionPort, this.connectionTimeout).subscribe(result => {
            this.testConnectionMessage = result.body;
        });
    }

    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInFlows() {
        this.eventSubscriber = this.eventManager.subscribe('flowListModification', response => this.load());
    }

    createOrEditHeader(step, formHeader: FormControl) {
        step.headerId = formHeader.value;

        if (step.headerId === null || typeof step.headerId === 'undefined' || !step.headerId) {
            const modalRef = this.headerPopupService.open(HeaderDialogComponent as Component);
            modalRef.then(res => {
                res.result.then(
                    result => {
                        this.setHeader(step, result.id, formHeader);
                    },
                    reason => {
                        this.setHeader(step, reason.id, formHeader);
                    }
                );
            });
        } else {
            const modalRef = this.headerPopupService.open(HeaderDialogComponent as Component, step.headerId);
            modalRef.then(res => {
                // Success
                res.result.then(
                    result => {
                        this.setHeader(step, result.id, formHeader);
                    },
                    reason => {
                        this.setHeader(step, reason.id, formHeader);
                    }
                );
            });
        }
    }

    createOrEditConnection(step, connectionType: string, formService: FormControl) {
        step.connectionId = formService.value;

        if (typeof step.connectionId === 'undefined' || step.connectionId === null || !step.connectionId) {
            const modalRef = this.connectionPopupService.open(ConnectionDialogComponent as Component);
            modalRef.then(res => {
                // Success
                res.componentInstance.connectionType = connectionType;
                res.result.then(
                    result => {
                        this.setConnection(step, result.id, formService);
                    },
                    reason => {
                        this.setConnection(step, reason.id, formService);
                    }
                );
            });
        } else {
            const modalRef = this.connectionPopupService.open(ConnectionDialogComponent as Component, step.connectionId);
            modalRef.then(res => {
                res.componentInstance.connectionType = connectionType;
                res.result.then(
                    result => {
                        this.setConnection(step, result.id, formService);
                    },
                    reason => {
                        this.setConnection(step, reason.id, formService);
                    }
                );
            });
        }
    }

    setHeader(step, id, formHeader: FormControl) {
        this.headerService.getAllHeaders().subscribe(
            res => {
                this.headers = res.body;
                this.headerCreated = this.headers.length > 0;
                this.requestStep.headerId = id;

                if (formHeader.value === null) {
                    formHeader.patchValue(id);
                }
            },
            res => this.onError(res.body)
        );
    }

    setConnection(step, id, formService: FormControl) {
        this.connectionService.getAllConnections().subscribe(
            res => {
                this.connections = res.body;
                this.connectionCreated = this.connections.length > 0;
                this.requestStep.connectionId = id;
                formService.patchValue(id);
                this.filterConnections(step, formService);
            },
            res => this.onError(res.body)
        );
    }

    handleErrorWhileCreatingFlow(flowId?: number, stepId?: number) {
        if (flowId !== null) {
            this.flowService.delete(flowId);
        }
        if (stepId !== null) {
            this.stepService.delete(stepId);
        }
        this.savingFlowFailed = true;
        this.isSaving = false;
    }

    export(flow: IFlow) {
        this.flowService.exportFlowConfiguration(flow);
    }

    send() {
        this.setValidationForm();

        if (!this.messageSenderForm.valid) {
            this.isSending = false;
            return;
        }

        this.isSending = true;
        this.isAlert = true;
        this.setRequest();

        if (this.requestHeaderId && this.requestConnectionId) {
            forkJoin(
                this.connectionService.getConnectionKeys(parseInt(this.requestConnectionId)),
                this.headerService.getHeaderKeys(parseInt(this.requestHeaderId))
            ).subscribe(([res, res2]) => {
                const connectionKeys = JSON.stringify(res.body);
                const headerKeys = JSON.stringify(res2.body);

                this.sendMessage(connectionKeys, headerKeys);
            });
        } else if (this.requestHeaderId) {
            this.headerService.getHeaderKeys(parseInt(this.requestHeaderId)).subscribe(
                res => {
                    const headerKeys = JSON.stringify(res.body);
                    this.sendMessage('', headerKeys);
                },
                res => {
                    this.handleSendError(res.error);
                }
            );
        } else if (this.requestConnectionId) {
            this.connectionService.getConnectionKeys(parseInt(this.requestConnectionId)).subscribe(
                res => {
                    const connectionKeys = JSON.stringify(res.body);
                    this.sendMessage(connectionKeys, '');
                },
                res => {
                    this.handleSendError(res.error);
                }
            );
        } else {
            this.sendMessage('', '');
        }
    }

    sendMessage(requestConnectionKeys, requestHeaderKeys) {
        if (this.requestExchangePattern === 'FireAndForget') {
            this.flowService
                .send(
                    1,
                    this.requestUri,
                    this.requestStepId,
                    this.requestConnectionId,
                    requestConnectionKeys,
                    requestHeaderKeys,
                    this.requestNumberOfTimes,
                    this.requestBody
                )
                .subscribe(
                    res => {
                        this.handleSendResponse(res.body, false);
                    },
                    res => {
                        this.handleSendError(res.error);
                    }
                );
        } else if (this.requestExchangePattern === 'RequestAndReply') {
            this.flowService
                .sendRequest(
                    1,
                    this.requestUri,
                    this.requestStepId,
                    this.requestConnectionId,
                    requestConnectionKeys,
                    requestHeaderKeys,
                    this.requestBody
                )
                .subscribe(
                    res => {
                        this.handleSendResponse(res.body, true);
                    },
                    res => {
                        this.handleSendError(res.error);
                    }
                );
        }
    }

    setRequest() {
        const stepForm = <FormGroup>(<FormArray>this.messageSenderForm.controls.stepsData).controls[0];

        this.requestExchangePattern = this.messageSenderForm.controls.exchangepattern.value;
        this.requestNumberOfTimes =
            this.messageSenderForm.controls.numberoftimes.value == null ? 1 : this.messageSenderForm.controls.numberoftimes.value;
        this.requestComponentType = stepForm.controls.componentType.value;
        this.requestOptions = '?';
        this.requestUri = this.requestStep.uri;
        this.requestStepId = this.requestStep.id == null ? '0' : this.requestStep.id.toString();
        this.requestHeaderId = stepForm.controls.header.value == null ? '' : stepForm.controls.header.value.toString();
        this.requestConnectionId = stepForm.controls.connection.value == null ? '' : stepForm.controls.connection.value.toString();
        this.requestBody = stepForm.controls.requestbody.value == null ? '0' : stepForm.controls.requestbody.value.toString();

        this.setStepOptions(this.stepsOptions[0], this.requestStep, this.selectOptions(0));

        if (this.requestOptions.length < 2) {
            this.requestUri = [this.requestComponentType.toLowerCase(), '://', this.requestUri].join('');
        } else {
            this.requestUri = [this.requestComponentType.toLowerCase(), '://', this.requestUri, this.requestOptions].join('');
        }
    }

    handleSendResponse(body: string, showResponse: boolean) {
		this.alertService.addAlert({
		  type: 'success',
		  message: 'Send successfully',
		});
        setTimeout(() => {
            this.isSending = false;
        }, 1000);
        if (showResponse) {
            this.setEditorMode(body);
            this.responseBody = body;
            this.active = '1';
        } else {
            this.responseBody = body;
        }
    }

    handleSendError(body: any) {
        this.isSending = false;
		this.alertService.addAlert({
		  type: 'danger',
		  message: 'Send failed',
		});
        this.responseBody = body;
        this.active = '1';
    }

    save() {
        this.isSaving = true;
        this.setDataFromForm();
        this.setOptions();
        this.setVersion();
        this.savingFlowFailed = false;
        this.savingFlowSuccess = false;
    }

    setValidationForm() {
        const flowControls = this.messageSenderForm.controls;

        (<FormArray>flowControls.stepsData).controls.forEach((step, index) => {
            this.setValidationOnStep(this.steps[index], (<FormGroup>step).controls);
        });
    }

    setValidationOnStep(step, formStepData) {
        formStepData.uri.setValidators([Validators.required]);
        formStepData.uri.updateValueAndValidity();
    }

    setDataFromForm() {
        const flowControls = this.messageSenderForm.controls;

        (<FormArray>flowControls.stepsData).controls.forEach((step, index) => {
            this.setDataFromFormOnStep(this.steps[index], (<FormGroup>step).controls);
        });
    }

    setDataFromFormOnStep(step, formStepData) {
        step.id = formStepData.id.value;
        step.componentType = formStepData.componentType.value;
        step.uri = formStepData.uri.value;
        step.connectionId = formStepData.connection.value;
        step.headerId = formStepData.header.value;
    }

    setVersion() {
        const now = dayjs();
    }

    // Get currrent scroll position
    findPos(obj) {
        let curtop = 0;

        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while ((obj = obj.offsetParent));
        }

        return curtop;
    }

    goBack() {
        window.history.back();
    }

    setInvalidUriMessage(stepName: string) {
        this.invalidUriMessage = `Uri for ${stepName} is not valid.`;
        setTimeout(() => {
            this.invalidUriMessage = '';
        }, 15000);
    }

    formatUri(stepOptions, step, formStep): string {
        if (formStep.controls.componentType.value === null) {
            return '';
        } else {
            const formOptions = <FormArray>formStep.controls.options;
            this.setStepOptions(stepOptions, step, formOptions);
            return `${formStep.controls.componentType.value.toLowerCase()}`;
        }
    }

    validateTypeAndUri(step: FormGroup) {
        step.controls.componentType.markAsTouched();
        step.controls.uri.markAsTouched();
    }

    markAsUntouchedTypeAndUri(step: FormGroup) {
        step.controls.componentType.markAsUntouched();
        step.controls.uri.markAsUntouched();
    }

    setEditorMode(str: string) {
        if (str.startsWith('{') || str.startsWith('[')) {
            this.responseEditorMode = 'javascript';
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
        const reader = new FileReader();
        reader.onload = () => {
            // console.log(reader.result);
            this.requestBody = reader.result.toString();
        };
        reader.readAsText(file);
    }

    private subscribeToSaveResponse(result: Observable<Flow>) {
        result.subscribe(
            (res: Flow) => this.onSaveSuccess(res),
            (res: Response) => this.onSaveError()
        );
    }

    private onSaveSuccess(result: Flow) {
	    this.eventManager.broadcast(new EventWithContent('flowListModification', 'OK'));
        this.isSaving = false;
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: error.message,
		});
    }
}
