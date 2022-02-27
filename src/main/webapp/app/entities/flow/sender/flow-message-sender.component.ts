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

import { Endpoint, EndpointType, IEndpoint } from 'app/shared/model/endpoint.model';
import { Service } from 'app/shared/model/service.model';
import { IHeader } from 'app/shared/model/header.model';

import { EndpointService } from '../../endpoint/endpoint.service';
import { ServiceService } from '../../service/service.service';
import { HeaderService } from 'app/entities/header/header.service';
import { GatewayService } from '../../gateway/gateway.service';

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Components } from 'app/shared/camel/component-type';
import { Services } from 'app/shared/camel/service-connections';

import { map } from 'rxjs/operators';

import { HeaderDialogComponent } from 'app/entities/header/header-dialog.component';
import { ServiceDialogComponent } from 'app/entities/service/service-dialog.component';

import { HeaderPopupService } from 'app/entities/header/header-popup.service';
import { ServicePopupService } from 'app/entities/service/service-popup.service';

import dayjs from 'dayjs/esm';

@Component({
    selector: 'jhi-flow-message-sender',
    templateUrl: './flow-message-sender.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FlowMessageSenderComponent implements OnInit, OnDestroy {
    flows: IFlow[];
    services: Service[];
    headers: IHeader[];

    endpointsOptions: Array<Array<Option>> = [[]];
    endpoints: IEndpoint[] = new Array<Endpoint>();
    URIList: IEndpoint[] = new Array<Endpoint>();

    endpoint: IEndpoint;
    requestEndpoint: IEndpoint;
    selectedSendEndpoint: IEndpoint;

    requestExchangePattern: string;
    requestNumberOfTimes: string;
    requestComponentType: string;
    requestUri: string;
    requestEndpointId: string;
    requestOptions: string;
    requestServiceId: string;
    requestHeaderId: string;
    requestServiceKeys: string;
    requestHeaderKeys: string;
    requestBody: string;

    responseBody: string;
    responseEditorMode = 'text';

    panelCollapsed: any = 'uno';
    public isCollapsed = true;
    active;
    disabled = true;
    activeEndpoint: any;

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
    serviceCreated: boolean;
    headerCreated: boolean;

    namePopoverMessage: string;
    endpointPopoverMessage: string;
    exchangePatternPopoverMessage: string;
    numberOfTimesPopoverMessage: string;

    componentPopoverMessage: string;
    optionsPopoverMessage: string;
    headerPopoverMessage: string;
    servicePopoverMessage: string;
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

    filterService: Array<Array<Service>> = [[]];
    serviceType: Array<string> = [];
    selectedService: Service = new Service();
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
        private endpointService: EndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router,
        public components: Components,
        public servicesList: Services,
        private modalService: NgbModal,
        private headerPopupService: HeaderPopupService,
        private servicePopupService: ServicePopupService
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
            this.serviceService.getAllServices(),
            this.headerService.getAllHeaders(),
            this.endpointService.query()
        ).subscribe(([wikiDocUrl, camelDocUrl, services, headers, endpoints]) => {
            this.wikiDocUrl = wikiDocUrl.body;

            this.camelDocUrl = camelDocUrl.body;

            this.endpoints = endpoints.body;

            this.services = services.body;
            this.serviceCreated = this.services.length > 0;

            this.headers = headers.body;
            this.headerCreated = this.headers.length > 0;

            this.initializeForm();

            this.messageSenderForm.controls.exchangepattern.setValue('FireAndForget');
            this.messageSenderForm.controls.templatefilter.setValue('ALL');

            this.requestEndpoint = new Endpoint();
            this.requestEndpoint.endpointType = EndpointType.TO;
            this.requestEndpoint.componentType = 'file';
            this.requestComponentType = 'file';

            (<FormArray>this.messageSenderForm.controls.endpointsData).push(this.initializeEndpointData(this.requestEndpoint));

            this.endpointsOptions[0] = [new Option()];

            this.setTypeLinks(this.requestEndpoint, 0);

            this.finished = true;
        });
    }

    // this filters services not of the correct type
    filterServices(endpoint: any, formService: FormControl) {
        this.serviceType[0] = this.servicesList.getServiceType(endpoint.componentType);
        this.filterService[0] = this.services.filter(f => f.type === this.serviceType[0]);
        if (this.filterService[0].length > 0 && endpoint.serviceId) {
            formService.setValue(this.filterService[0].find(fs => fs.id === endpoint.serviceId).id);
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

    setTypeLinks(endpoint: any, endpointFormIndex?, e?: Event) {
        const endpointForm = <FormGroup>(<FormArray>this.messageSenderForm.controls.endpointsData).controls[endpointFormIndex];

        if (typeof e !== 'undefined') {
            endpoint.componentType = e;
            this.requestComponentType = endpoint.componentType;
        } else {
            endpoint.componentType = 'file';
            this.requestComponentType = 'file';
        }

        let type;
        let camelType;
        let componentType;
        let camelComponentType;

        componentType = endpoint.componentType.toLowerCase();

        camelComponentType = this.components.getCamelComponentType(componentType);

        type = this.components.types.find(x => x.name === endpoint.componentType.toString());
        camelType = this.components.types.find(x => x.name === camelComponentType.toUpperCase());

        endpointForm.controls.componentType.patchValue(endpoint.componentType);
        endpointForm.controls.service.setValue('');
        this.filterServices(endpoint, endpointForm.controls.service as FormControl);

        this.componentTypeAssimblyLinks[endpointFormIndex] = this.wikiDocUrl + '/component-' + componentType;
        this.componentTypeCamelLinks[endpointFormIndex] = this.camelDocUrl + '/' + camelComponentType + '-component.html';

        this.uriPlaceholders[endpointFormIndex] = type.syntax;
        this.uriPopoverMessages[endpointFormIndex] = type.description;

        // set options keys
        this.getComponentOptions(camelComponentType).subscribe(data => {
            const componentOptions = data.properties;

            this.componentOptions[0] = Object.keys(componentOptions).map(key => ({ ...componentOptions[key], ...{ name: key } }));
            this.componentOptions[0].sort(function(a, b) {
                return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
            });
        });

        this.enableFields(endpointForm);

        this.setURIlist();
    }

    setPopoverMessages() {
        this.namePopoverMessage = `Name of the flow. Usually the name of the message type like <i>order</i>.<br/><br>Displayed on the <i>flows</i> page.`;
        this.endpointPopoverMessage = `The uris that can be selected in the request`;
        this.exchangePatternPopoverMessage = `Fire and Forget (InOnly) or Request and Reply (InOut)`;
        this.numberOfTimesPopoverMessage = `Number of messages send (1 by default). This setting is only for FireAndForget pattern`;
        this.componentPopoverMessage = `The Apache Camel scheme to use. Click on the Apache Camel or Assimbly button for online documentation on the selected scheme.`;
        this.optionsPopoverMessage = `Options for the selected component. You can add one or more key/value pairs.<br/><br/>
                                     Click on the Apache Camel button to view documation on the valid options.`;
        this.headerPopoverMessage = `A group of key/value pairs to add to the message header.<br/><br/> Use the button on the right to create or edit a header.`;
        this.servicePopoverMessage = `If available then a service can be selected. For example a service that sets up a connection.<br/><br/>
                                     Use the button on the right to create or edit services.`;
        this.popoverMessage = `Destination`;
        this.hostnamePopoverMessage = `URL, IP-address or DNS Name. For example camel.apache.org or 127.0.0.1`;
        this.portPopoverMessage = `Number of the port. Range between 1 and 65536`;
        this.timeoutPopoverMessage = `Timeout in seconds to wait for connection.`;
    }

    enableFields(endpointForm) {
        const componentHasService = this.servicesList.getServiceType(endpointForm.controls.componentType.value);

        if (endpointForm.controls.componentType.value === 'wastebin') {
            endpointForm.controls.uri.disable();
            endpointForm.controls.options.disable();
            endpointForm.controls.service.disable();
            endpointForm.controls.header.disable();
        } else if (componentHasService) {
            endpointForm.controls.uri.enable();
            endpointForm.controls.options.enable();
            endpointForm.controls.header.enable();
            endpointForm.controls.service.enable();
        } else {
            endpointForm.controls.uri.enable();
            endpointForm.controls.options.enable();
            endpointForm.controls.header.enable();
            endpointForm.controls.service.disable();
        }
    }

    setURIlist() {
        this.URIList = [];

        const tEndpointsUnique = this.endpoints.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

        tEndpointsUnique.forEach((endpoint, i) => {
            if (this.requestComponentType === endpoint.componentType) {
                this.URIList.push(endpoint);
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
            endpointsData: new FormArray([]),
			responsebody: new FormControl('')
        });
    }

    initializeEndpointData(endpoint: Endpoint): FormGroup {
        return new FormGroup({
            id: new FormControl(endpoint.id),
            componentType: new FormControl(endpoint.componentType, Validators.required),
            uri: new FormControl(endpoint.uri),
            options: new FormArray([this.initializeOption()]),
            header: new FormControl(endpoint.headerId),
            service: new FormControl(endpoint.serviceId, Validators.required),
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
        const endpointsData = this.messageSenderForm.controls.endpointsData as FormArray;
        this.endpoints.forEach((endpoint, i) => {
            this.updateEndpointData(endpoint, endpointsData.controls[i] as FormControl);
        });
    }

    updateTemplateData() {
        this.messageSenderForm.patchValue({
            name: '',
            exchangePattern: '',
            numberoftimes: ''
        });
    }

    updateEndpointData(endpoint: any, endpointData: FormControl) {
        endpointData.patchValue({
            id: endpoint.id,
            endpointType: endpoint.endpointType,
            componentType: endpoint.componentType,
            uri: endpoint.uri,
            service: endpoint.serviceId,
            header: endpoint.headerId
        });
    }

    getComponentOptions(componentType: String): any {
        return this.flowService.getComponentOptions(1, componentType).pipe(
            map(options => {
                return options.body;
            })
        );
    }

    getOptions(endpoint: any, endpointForm: any, endpointOptions: Array<Option>) {
        if (!endpoint.options) {
            endpoint.options = '';
        }

        const options = endpoint.options.split('&');

        options.forEach((option, index) => {
            const o = new Option();

            if (typeof endpointForm.controls.options.controls[index] === 'undefined') {
                endpointForm.controls.options.push(this.initializeOption());
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

            endpointForm.controls.options.controls[index].patchValue({
                key: o.key,
                value: o.value
            });

            endpointOptions.push(o);
        });
    }

    setOptions() {
        this.endpoints.forEach((endpoint, i) => {
            endpoint.options = '';
            this.setEndpointOptions(this.endpointsOptions[i], endpoint, this.selectOptions(i));
        });
    }

    setEndpointOptions(endpointOptions: Array<Option>, endpoint, formOptions: FormArray) {
        let index = 0;

        endpointOptions.forEach((option, i) => {
            option.key = (<FormGroup>formOptions.controls[i]).controls.key.value;
            option.value = (<FormGroup>formOptions.controls[i]).controls.value.value;

            console.log('option.key=' + option.key);
            console.log('option.value=' + option.value);

            if (option.key && option.value) {
                this.requestOptions += index > 0 ? `&${option.key}=${option.value}` : `${option.key}=${option.value}`;
                index++;
            }

            console.log('setEndpointOptions');
        });
    }

    addOption(options: Array<Option>, endpointIndex) {
        this.selectOptions(endpointIndex).push(this.initializeOption());
        options.push(new Option());
    }

    removeOption(options: Array<Option>, option: Option, endpointIndex) {
        const index = options.indexOf(option);
        const formOptions = this.selectOptions(endpointIndex);
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

    selectOptions(endpointIndex): FormArray {
        const endpointData = (<FormArray>this.messageSenderForm.controls.endpointsData).controls[endpointIndex];
        return <FormArray>(<FormGroup>endpointData).controls.options;
    }

    changeOptionSelection(selectedOption, index, optionIndex) {
        const componentOption = this.componentOptions[index].filter(option => option.name === selectedOption);
        const defaultValue = componentOption[0].defaultValue;

        const endpointData = (<FormArray>this.messageSenderForm.controls.endpointsData).controls[0];
        const formOptions = <FormArray>(<FormGroup>endpointData).controls.options;

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

    createOrEditHeader(endpoint, formHeader: FormControl) {
        endpoint.headerId = formHeader.value;

        if (endpoint.headerId === null || typeof endpoint.headerId === 'undefined' || !endpoint.headerId) {
            const modalRef = this.headerPopupService.open(HeaderDialogComponent as Component);
            modalRef.then(res => {
                res.result.then(
                    result => {
                        this.setHeader(endpoint, result.id, formHeader);
                    },
                    reason => {
                        this.setHeader(endpoint, reason.id, formHeader);
                    }
                );
            });
        } else {
            const modalRef = this.headerPopupService.open(HeaderDialogComponent as Component, endpoint.headerId);
            modalRef.then(res => {
                // Success
                res.result.then(
                    result => {
                        this.setHeader(endpoint, result.id, formHeader);
                    },
                    reason => {
                        this.setHeader(endpoint, reason.id, formHeader);
                    }
                );
            });
        }
    }

    createOrEditService(endpoint, serviceType: string, formService: FormControl) {
        endpoint.serviceId = formService.value;

        if (typeof endpoint.serviceId === 'undefined' || endpoint.serviceId === null || !endpoint.serviceId) {
            const modalRef = this.servicePopupService.open(ServiceDialogComponent as Component);
            modalRef.then(res => {
                // Success
                res.componentInstance.serviceType = serviceType;
                res.result.then(
                    result => {
                        this.setService(endpoint, result.id, formService);
                    },
                    reason => {
                        this.setService(endpoint, reason.id, formService);
                    }
                );
            });
        } else {
            const modalRef = this.servicePopupService.open(ServiceDialogComponent as Component, endpoint.serviceId);
            modalRef.then(res => {
                res.componentInstance.serviceType = serviceType;
                res.result.then(
                    result => {
                        this.setService(endpoint, result.id, formService);
                    },
                    reason => {
                        this.setService(endpoint, reason.id, formService);
                    }
                );
            });
        }
    }

    setHeader(endpoint, id, formHeader: FormControl) {
        this.headerService.getAllHeaders().subscribe(
            res => {
                this.headers = res.body;
                this.headerCreated = this.headers.length > 0;
                this.requestEndpoint.headerId = id;

                if (formHeader.value === null) {
                    formHeader.patchValue(id);
                }
            },
            res => this.onError(res.body)
        );
    }

    setService(endpoint, id, formService: FormControl) {
        this.serviceService.getAllServices().subscribe(
            res => {
                this.services = res.body;
                this.serviceCreated = this.services.length > 0;
                this.requestEndpoint.serviceId = id;
                formService.patchValue(id);
                this.filterServices(endpoint, formService);
            },
            res => this.onError(res.body)
        );
    }

    handleErrorWhileCreatingFlow(flowId?: number, endpointId?: number) {
        if (flowId !== null) {
            this.flowService.delete(flowId);
        }
        if (endpointId !== null) {
            this.endpointService.delete(endpointId);
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

        if (this.requestHeaderId && this.requestServiceId) {
            forkJoin(
                this.serviceService.getServiceKeys(parseInt(this.requestServiceId)),
                this.headerService.getHeaderKeys(parseInt(this.requestHeaderId))
            ).subscribe(([res, res2]) => {
                const serviceKeys = JSON.stringify(res.body);
                const headerKeys = JSON.stringify(res2.body);

                this.sendMessage(serviceKeys, headerKeys);
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
        } else if (this.requestServiceId) {
            this.serviceService.getServiceKeys(parseInt(this.requestServiceId)).subscribe(
                res => {
                    const serviceKeys = JSON.stringify(res.body);
                    this.sendMessage(serviceKeys, '');
                },
                res => {
                    this.handleSendError(res.error);
                }
            );
        } else {
            this.sendMessage('', '');
        }
    }

    sendMessage(requestServiceKeys, requestHeaderKeys) {
        if (this.requestExchangePattern === 'FireAndForget') {
            this.flowService
                .send(
                    1,
                    this.requestUri,
                    this.requestEndpointId,
                    this.requestServiceId,
                    requestServiceKeys,
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
                    this.requestEndpointId,
                    this.requestServiceId,
                    requestServiceKeys,
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
        const endpointForm = <FormGroup>(<FormArray>this.messageSenderForm.controls.endpointsData).controls[0];

        this.requestExchangePattern = this.messageSenderForm.controls.exchangepattern.value;
        this.requestNumberOfTimes =
            this.messageSenderForm.controls.numberoftimes.value == null ? 1 : this.messageSenderForm.controls.numberoftimes.value;
        this.requestComponentType = endpointForm.controls.componentType.value;
        this.requestOptions = '?';
        this.requestUri = this.requestEndpoint.uri;
        this.requestEndpointId = this.requestEndpoint.id == null ? '0' : this.requestEndpoint.id.toString();
        this.requestHeaderId = endpointForm.controls.header.value == null ? '' : endpointForm.controls.header.value.toString();
        this.requestServiceId = endpointForm.controls.service.value == null ? '' : endpointForm.controls.service.value.toString();
        this.requestBody = endpointForm.controls.requestbody.value == null ? '0' : endpointForm.controls.requestbody.value.toString();

        this.setEndpointOptions(this.endpointsOptions[0], this.requestEndpoint, this.selectOptions(0));

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

        (<FormArray>flowControls.endpointsData).controls.forEach((endpoint, index) => {
            this.setValidationOnEndpoint(this.endpoints[index], (<FormGroup>endpoint).controls);
        });
    }

    setValidationOnEndpoint(endpoint, formEndpointData) {
        formEndpointData.uri.setValidators([Validators.required]);
        formEndpointData.uri.updateValueAndValidity();
    }

    setDataFromForm() {
        const flowControls = this.messageSenderForm.controls;

        (<FormArray>flowControls.endpointsData).controls.forEach((endpoint, index) => {
            this.setDataFromFormOnEndpoint(this.endpoints[index], (<FormGroup>endpoint).controls);
        });
    }

    setDataFromFormOnEndpoint(endpoint, formEndpointData) {
        endpoint.id = formEndpointData.id.value;
        endpoint.componentType = formEndpointData.componentType.value;
        endpoint.uri = formEndpointData.uri.value;
        endpoint.serviceId = formEndpointData.service.value;
        endpoint.headerId = formEndpointData.header.value;
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

    setInvalidUriMessage(endpointName: string) {
        this.invalidUriMessage = `Uri for ${endpointName} is not valid.`;
        setTimeout(() => {
            this.invalidUriMessage = '';
        }, 15000);
    }

    formatUri(endpointOptions, endpoint, formEndpoint): string {
        if (formEndpoint.controls.componentType.value === null) {
            return '';
        } else {
            const formOptions = <FormArray>formEndpoint.controls.options;
            this.setEndpointOptions(endpointOptions, endpoint, formOptions);
            return `${formEndpoint.controls.componentType.value.toLowerCase()}`;
        }
    }

    validateTypeAndUri(endpoint: FormGroup) {
        endpoint.controls.componentType.markAsTouched();
        endpoint.controls.uri.markAsTouched();
    }

    markAsUntouchedTypeAndUri(endpoint: FormGroup) {
        endpoint.controls.componentType.markAsUntouched();
        endpoint.controls.uri.markAsUntouched();
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
