import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Gateway } from 'app/shared/model/gateway.model';
import { Flow, IFlow, LogLevelType } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { Endpoint, EndpointType, IEndpoint } from 'app/shared/model/endpoint.model';
import { Service } from 'app/shared/model/service.model';
import { IHeader } from 'app/shared/model/header.model';

import { EndpointService } from '../endpoint/';
import { ServiceService } from '../service';
import { HeaderService } from '../header';
import { GatewayService } from '../gateway';

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Components, ComponentType, typesLinks } from '../../shared/camel/component-type';
import { Services } from '../../shared/camel/service-connections';

import { map } from 'rxjs/operators';

import { HeaderDialogComponent, HeaderPopupService } from 'app/entities/header';
import { ServiceDialogComponent, ServicePopupService } from 'app/entities/service';
import * as moment from 'moment';

@Component({
    selector: 'jhi-flow-edit-all',
    templateUrl: './flow-edit-all.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FlowEditAllComponent implements OnInit, OnDestroy {
    flow: IFlow;
    services: Service[];
    headers: IHeader[];

    endpointsOptions: Array<Array<Option>> = [[]];
    URIList: IEndpoint[] = new Array<Endpoint>();
    allendpoints: IEndpoint[] = new Array<Endpoint>();
    endpoints: IEndpoint[] = new Array<Endpoint>();
    endpoint: IEndpoint;

    public endpointTypes = ['FROM', 'TO', 'ERROR'];

    public logLevelListType = [
        LogLevelType.OFF,
        LogLevelType.INFO,
        LogLevelType.ERROR,
        LogLevelType.TRACE,
        LogLevelType.WARN,
        LogLevelType.DEBUG
    ];

    panelCollapsed: any = 'uno';
    public isCollapsed = true;
    active;
    disabled = true;
    activeEndpoint: any;

    isSaving: boolean;
    savingFlowFailed = false;
    savingFlowFailedMessage = 'Saving failed (check logs)';
    savingFlowSuccess = false;
    savingFlowSuccessMessage = 'Flow successfully saved';
    finished = false;

    gateways: Gateway[];
    configuredGateway: Gateway;
    gatewayName: String;
    singleGateway = false;
    indexGateway: number;

    embeddedBroker = false;
    createRoute: number;
    predicate: any;
    reverse: any;
    serviceCreated: boolean;
    headerCreated: boolean;

    namePopoverMessage: string;
    autoStartPopoverMessage: string;
    offloadingPopoverMessage: string;
    maximumRedeliveriesPopoverMessage: string;
    redeliveryDelayPopoverMessage: string;
    logLevelPopoverMessage: string;

    componentPopoverMessage: string;
    optionsPopoverMessage: string;
    headerPopoverMessage: string;
    servicePopoverMessage: string;
    popoverMessage: string;

    selectedComponentType: string;
    selectedOption: Array<any> = [];
    componentOptions: Array<any> = [];

    componentTypeAssimblyLinks: Array<string> = new Array<string>();
    componentTypeCamelLinks: Array<string> = new Array<string>();
    uriPlaceholders: Array<string> = new Array<string>();
    uriPopoverMessages: Array<string> = new Array<string>();

    typesLinks: Array<TypeLinks>;
    editFlowForm: FormGroup;
    displayNextButton = false;
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

    numberOfFromEndpoints: number = 0;
    numberOfToEndpoints: number = 0;

    private subscription: Subscription;
    private eventSubscriber: Subscription;
    private wikiDocUrl: string;
    private camelDocUrl: string;

    modalRef: NgbModalRef | null;

    constructor(
        private eventManager: JhiEventManager,
        private gatewayService: GatewayService,
        private flowService: FlowService,
        private endpointService: EndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private jhiAlertService: JhiAlertService,
        private route: ActivatedRoute,
        private router: Router,
        public servicesList: Services,
        public components: Components,
        private modalService: NgbModal,
        private headerPopupService: HeaderPopupService,
        private servicePopupService: ServicePopupService
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.createRoute = 0;

        this.setPopoverMessages();

        this.activeEndpoint = this.route.snapshot.queryParamMap.get('endpointid');

        this.subscription = this.route.params.subscribe(params => {
            if (params['mode'] === 'clone') {
                this.load(params['id'], true);
            } else {
                this.load(params['id'], false);
            }
        });

        this.registerChangeInFlows();
    }

    load(id, isCloning?: boolean) {
        forkJoin(
            this.flowService.getWikiDocUrl(),
            this.flowService.getCamelDocUrl(),
            this.serviceService.getAllServices(),
            this.headerService.getAllHeaders(),
            this.gatewayService.query(),
            this.endpointService.query(),
            this.flowService.getGatewayName()
        ).subscribe(([wikiDocUrl, camelDocUrl, services, headers, gateways, allendpoints, gatewayName]) => {
            this.wikiDocUrl = wikiDocUrl.body;

            this.camelDocUrl = camelDocUrl.body;

            this.services = services.body;
            this.serviceCreated = this.services.length > 0;

            this.headers = headers.body;
            this.headerCreated = this.headers.length > 0;

            this.gateways = gateways.body;
            this.singleGateway = this.gateways.length === 1;
            this.gatewayName = gatewayName.body;

            this.allendpoints = allendpoints.body;

            if (this.singleGateway) {
                this.indexGateway = 0;
                if (this.gateways[this.indexGateway].type.valueOf().toLocaleLowerCase() == 'broker') {
                    this.embeddedBroker = true;
                }
            } else {
                this.indexGateway = this.gateways.findIndex(gateway => gateway.name === this.gatewayName);
                if (this.gateways[this.indexGateway].type.valueOf().toLocaleLowerCase() == 'broker') {
                    this.embeddedBroker = true;
                }
            }

            if (id) {
                this.flowService.find(id).subscribe(flow => {
                    if (flow) {
                        this.flow = flow.body;
                        if (this.singleGateway) {
                            this.flow.gatewayId = this.gateways[this.indexGateway].id;
                        }

                        this.initializeForm(this.flow);

                        this.endpointService.findByFlowId(id).subscribe(flowEndpointsData => {
                            let endpoints = flowEndpointsData.body;
                            let index = 0;
                            this.endpoints = [];

                            this.endpointTypes.forEach((endpointType, j) => {
                                let filteredEndpoints = endpoints.filter(endpoint => endpoint.endpointType === endpointType);

                                filteredEndpoints.forEach((endpoint, i) => {
                                    if (typeof this.endpointsOptions[index] === 'undefined') {
                                        this.endpointsOptions.push([]);
                                    }

                                    this.endpoint = new Endpoint(
                                        endpoint.id,
                                        endpoint.endpointType,
                                        endpoint.componentType,
                                        endpoint.uri,
                                        endpoint.options,
                                        endpoint.flowId,
                                        endpoint.serviceId,
                                        endpoint.headerId
                                    );

                                    this.endpoints.push(endpoint);

                                    let formgroup = this.initializeEndpointData(endpoint);
                                    (<FormArray>this.editFlowForm.controls.endpointsData).insert(index, formgroup);

                                    this.getOptions(
                                        endpoint,
                                        this.editFlowForm.controls.endpointsData.get(index.toString()),
                                        this.endpointsOptions[index]
                                    );

                                    if (this.endpoint.endpointType === 'FROM') {
                                        this.numberOfFromEndpoints = this.numberOfFromEndpoints + 1;
                                    } else if (this.endpoint.endpointType === 'TO') {
                                        this.numberOfToEndpoints = this.numberOfToEndpoints + 1;
                                    }

                                    this.setTypeLinks(endpoint, index);

                                    index = index + 1;
                                }, this);
                            }, this);

                            if (this.activeEndpoint) {
                                const activeIndex = this.endpoints.findIndex(item => item.id == this.activeEndpoint);
                                if (activeIndex === -1) {
                                    this.active = '0';
                                } else {
                                    this.active = activeIndex.toString();
                                }
                            } else {
                                this.active = '0';
                            }

                            if (isCloning) {
                                this.clone();
                            }

                            this.finished = true;
                        });
                    }
                });
            } else if (!this.finished) {
                setTimeout(() => {
                    this.flow = new Flow();
                    this.flow.autoStart = false;
                    this.flow.offLoading = false;
                    this.flow.maximumRedeliveries = 0;
                    this.flow.redeliveryDelay = 3000;
                    this.flow.logLevel = LogLevelType.OFF;
                    if (this.singleGateway) {
                        this.indexGateway = 0;
                        this.flow.gatewayId = this.gateways[this.indexGateway].id;
                    } else {
                        this.configuredGateway = this.gateways.find(gateway => gateway.name === this.gatewayName);
                        this.indexGateway = this.gateways.findIndex(gateway => gateway.name === this.gatewayName);
                        this.flow.gatewayId = this.configuredGateway.id;
                    }
                    this.initializeForm(this.flow);

                    this.endpoint = new Endpoint();
                    this.endpoint.endpointType = EndpointType.FROM;

                    this.endpoint.componentType = ComponentType[this.gateways[this.indexGateway].defaultFromComponentType];
                    (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.endpoint));
                    this.endpointsOptions[0] = [new Option()];
                    this.setTypeLinks(this.endpoint, 0);
                    this.numberOfFromEndpoints = 1;

                    this.endpoints.push(this.endpoint);

                    this.endpoint = new Endpoint();
                    this.endpoint.endpointType = EndpointType.TO;
                    this.endpoint.componentType = ComponentType[this.gateways[this.indexGateway].defaultToComponentType];
                    (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.endpoint));
                    this.endpointsOptions[1] = [new Option()];
                    this.setTypeLinks(this.endpoint, 1);
                    this.numberOfToEndpoints = 1;

                    this.endpoints.push(this.endpoint);

                    this.endpoint = new Endpoint();
                    this.endpoint.endpointType = EndpointType.ERROR;
                    this.endpoint.componentType = ComponentType[this.gateways[this.indexGateway].defaultErrorComponentType];
                    (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.endpoint));
                    this.endpointsOptions[2] = [new Option()];
                    this.setTypeLinks(this.endpoint, 2);

                    this.endpoints.push(this.endpoint);

                    this.finished = true;
                    this.displayNextButton = true;
                }, 0);
            }

            this.active = '0';
        });
    }

    clone() {
        //reset id and flow name to null
        this.flow.id = null;
        this.flow.name = null;
        this.flow.endpoints = null;

        this.endpoints.forEach((endpoint, i) => {
            endpoint.id = null;
        });

        this.updateForm();

        let scrollToTop = window.setInterval(() => {
            let pos = window.pageYOffset;
            if (pos > 0) {
                window.scrollTo(0, pos - 20); // how far to scroll on each step
            } else {
                window.clearInterval(scrollToTop);
            }
        }, 16);
    }

    //this filters services not of the correct type
    filterServices(endpoint: any, formService: FormControl) {
        this.serviceType[this.endpoints.indexOf(endpoint)] = this.servicesList.getServiceType(endpoint.componentType);
        this.filterService[this.endpoints.indexOf(endpoint)] = this.services.filter(
            f => f.type === this.serviceType[this.endpoints.indexOf(endpoint)]
        );

        if (this.filterService[this.endpoints.indexOf(endpoint)].length > 0 && endpoint.serviceId) {
            formService.setValue(this.filterService[this.endpoints.indexOf(endpoint)].find(fs => fs.id === endpoint.serviceId).id);
        }
    }

    setTypeLinks(endpoint: any, endpointFormIndex?, e?: Event) {
        const endpointForm = <FormGroup>(<FormArray>this.editFlowForm.controls.endpointsData).controls[endpointFormIndex];

        if (typeof e !== 'undefined') {
            endpoint.componentType = e;
            endpointForm.controls.service.setValue(endpoint.serviceId);
        } else if (!endpoint.type === null) {
            endpoint.componentType = 'FILE';
        }

        let type;
        let camelType;
        let componentType;
        let camelComponentType;

        this.selectedComponentType = endpoint.componentType.toString();
        componentType = endpoint.componentType.toString().toLowerCase();

        camelComponentType = this.components.getCamelComponentType(componentType);

        type = typesLinks.find(x => x.name === endpoint.componentType.toString());
        camelType = typesLinks.find(x => x.name === camelComponentType.toUpperCase());

        this.filterServices(endpoint, endpointForm.controls.service as FormControl);

        this.componentTypeAssimblyLinks[endpointFormIndex] = this.wikiDocUrl + type.assimblyTypeLink;
        this.componentTypeCamelLinks[endpointFormIndex] = this.camelDocUrl + camelType.camelTypeLink;

        this.uriPlaceholders[endpointFormIndex] = type.uriPlaceholder;
        this.uriPopoverMessages[endpointFormIndex] = type.uriPopoverMessage;

        // set options keys
        this.getComponentOptions(camelComponentType).subscribe(data => {
            let componentOptions = data.properties;

            this.componentOptions[this.endpoints.indexOf(endpoint)] = Object.keys(componentOptions).map(key => ({
                ...componentOptions[key],
                ...{ name: key }
            }));
            this.componentOptions[this.endpoints.indexOf(endpoint)].sort(function(a, b) {
                return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
            });
        });

        endpointForm.patchValue({ componentType: componentType.toUpperCase() });

        this.enableFields(endpointForm);

        this.setURIlist();
    }

    setPopoverMessages() {
        this.namePopoverMessage = `Name of the flow. Usually the name of the message type like <i>order</i>.<br/><br>Displayed on the <i>flows</i> page.`;
        this.autoStartPopoverMessage = `If true then the flow starts automatically when the gateway starts.`;
        this.offloadingPopoverMessage = `If true then the flow sends a copy of every message to the wiretap endpoint.<br/><br/>
                                         This endpoint is configured at <i>Settings --> Offloading</i>.`;
        this.maximumRedeliveriesPopoverMessage = `The maximum times a messages is redelivered in case of failure.<br/><br/>`;
        this.redeliveryDelayPopoverMessage = `The delay in miliseconds between redeliveries (this delays all messages!)`;
        this.logLevelPopoverMessage = `Sets the log level of flow (default=OFF). This logs incoming and outgoing messages in the flow`;
        this.componentPopoverMessage = `The Apache Camel scheme to use. Click on the Apache Camel or Assimbly button for online documentation on the selected scheme.`;
        this.optionsPopoverMessage = `Options for the selected component. You can add one or more key/value pairs.<br/><br/>
                                     Click on the Apache Camel button to view documation on the valid options.`;
        this.optionsPopoverMessage = ``;
        this.headerPopoverMessage = `A group of key/value pairs to add to the message header.<br/><br/> Use the button on the right to create or edit a header.`;
        this.servicePopoverMessage = `If available then a service can be selected. For example a service that sets up a connection.<br/><br/>
                                     Use the button on the right to create or edit services.`;
        this.popoverMessage = `Destination`;
        this.hostnamePopoverMessage = `URL, IP-address or DNS Name. For example camel.apache.org or 127.0.0.1`;
        this.portPopoverMessage = `Number of the port. Range between 1 and 65536`;
        this.timeoutPopoverMessage = `Timeout in seconds to wait for connection.`;
    }

    setURIlist() {
        this.URIList = [];

        let tEndpointsUnique = this.allendpoints.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

        tEndpointsUnique.forEach((endpoint, i) => {
            if (this.selectedComponentType === endpoint.componentType) {
                this.URIList.push(endpoint);
            }
        });
    }

    enableFields(endpointForm) {
        let componentHasService = this.servicesList.getServiceType(endpointForm.controls.componentType.value);

        if (endpointForm.controls.componentType.value === 'WASTEBIN') {
            endpointForm.controls.uri.disable();
            endpointForm.controls.options.disable();
            endpointForm.controls.service.disable();
            endpointForm.controls.header.disable();
        } else if (endpointForm.controls.componentType.value === 'WASTEBIN') {
            endpointForm.controls.uri.enable();
            endpointForm.controls.options.enable();
            endpointForm.controls.header.enable();
            if (this.embeddedBroker) {
                endpointForm.controls.service.disable();
            } else {
                endpointForm.controls.service.enable();
            }
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

    initializeForm(flow: Flow) {
        this.editFlowForm = new FormGroup({
            id: new FormControl(flow.id),
            name: new FormControl(flow.name, Validators.required),
            autoStart: new FormControl(flow.autoStart),
            offloading: new FormControl(flow.offLoading),
            maximumRedeliveries: new FormControl(flow.maximumRedeliveries),
            redeliveryDelay: new FormControl(flow.redeliveryDelay),
            logLevel: new FormControl(flow.logLevel),
            gateway: new FormControl(flow.gatewayId),
            endpointsData: new FormArray([])
        });
    }

    initializeEndpointData(endpoint: Endpoint): FormGroup {
        return new FormGroup({
            id: new FormControl(endpoint.id),
            componentType: new FormControl(endpoint.componentType, Validators.required),
            uri: new FormControl(endpoint.uri),
            options: new FormArray([this.initializeOption()]),
            header: new FormControl(endpoint.headerId),
            service: new FormControl(endpoint.serviceId, Validators.required)
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
        this.updateFlowData(this.flow);

        let endpointsData = this.editFlowForm.controls.endpointsData as FormArray;
        this.endpoints.forEach((endpoint, i) => {
            this.updateEndpointData(endpoint, endpointsData.controls[i] as FormControl);
        });
    }

    updateFlowData(flow: Flow) {
        this.editFlowForm.patchValue({
            id: flow.id,
            name: flow.name,
            autoStart: flow.autoStart,
            offloading: flow.offLoading,
            maximumRedeliveries: flow.maximumRedeliveries,
            redeliveryDelay: flow.redeliveryDelay,
            logLevel: flow.logLevel,
            gateway: flow.gatewayId
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
            if (option.key && option.value) {
                endpoint.options += index > 0 ? `&${option.key}=${option.value}` : `${option.key}=${option.value}`;
                index++;
            }
        });
    }

    addOption(options: Array<Option>, endpointIndex) {
        this.selectOptions(endpointIndex).push(this.initializeOption());
        options.push(new Option());
    }

    removeOption(options: Array<Option>, option: Option, endpointIndex) {
        const index = options.indexOf(option);
        let formOptions = this.selectOptions(endpointIndex);
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
        const endpointData = (<FormArray>this.editFlowForm.controls.endpointsData).controls[endpointIndex];
        return <FormArray>(<FormGroup>endpointData).controls.options;
    }

    changeOptionSelection(selectedOption, index, optionIndex) {
        let componentOption = this.componentOptions[index].filter(option => option.name === selectedOption);
        let defaultValue = componentOption[0].defaultValue;

        const endpointData = (<FormArray>this.editFlowForm.controls.endpointsData).controls[index];
        const formOptions = <FormArray>(<FormGroup>endpointData).controls.options;

        if (defaultValue) {
            (<FormGroup>formOptions.controls[optionIndex]).controls.defaultValue.patchValue('Default Value: ' + defaultValue);
        } else {
            (<FormGroup>formOptions.controls[optionIndex]).controls.defaultValue.patchValue('');
        }
    }

    addEndpoint(endpoint, index) {
        this.endpoints.splice(index + 1, 0, new Endpoint());
        this.endpointsOptions.splice(index + 1, 0, [new Option()]);

        if (endpoint.endpointType === 'FROM') {
            this.numberOfFromEndpoints = this.numberOfFromEndpoints + 1;
        } else if (endpoint.endpointType === 'TO') {
            this.numberOfToEndpoints = this.numberOfToEndpoints + 1;
        }

        const newEndpoint = this.endpoints.find((e, i) => i === index + 1);

        newEndpoint.endpointType = endpoint.endpointType;
        newEndpoint.componentType = ComponentType[this.gateways[this.indexGateway].defaultToComponentType];

        (<FormArray>this.editFlowForm.controls.endpointsData).insert(index + 1, this.initializeEndpointData(newEndpoint));

        this.setTypeLinks(endpoint, index + 1);

        const newIndex = index + 1;

        this.active = newIndex.toString();
    }

    removeEndpoint(endpoint, endpointDataName) {
        if (endpoint.endpointType === 'FROM') {
            this.numberOfFromEndpoints = this.numberOfFromEndpoints - 1;
        } else if (endpoint.endpointType === 'TO') {
            this.numberOfToEndpoints = this.numberOfToEndpoints - 1;
        }

        const i = this.endpoints.indexOf(endpoint);
        this.endpoints.splice(i, 1);
        this.endpointsOptions.splice(i, 1);
        this.editFlowForm.removeControl(endpointDataName);
        (<FormArray>this.editFlowForm.controls.endpointsData).removeAt(i);
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

        this.flowService
            .testConnection(this.flow.gatewayId, this.connectionHost, this.connectionPort, this.connectionTimeout)
            .subscribe(result => {
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
        this.eventSubscriber = this.eventManager.subscribe('flowListModification', response => this.load(this.flow.id));
    }

    createOrEditHeader(endpoint, formHeader: FormControl) {
        endpoint.headerId = formHeader.value;

        if (typeof endpoint.headerId === 'undefined' || endpoint.headerId === null || !endpoint.headerId) {
            let modalRef = this.headerPopupService.open(HeaderDialogComponent as Component);
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
                endpoint.headerId = id;

                if (formHeader.value === null) {
                    formHeader.patchValue(id);
                }
                endpoint = null;
            },
            res => this.onError(res.body)
        );
    }

    setService(endpoint, id, formService: FormControl) {
        this.serviceService.getAllServices().subscribe(
            res => {
                this.services = res.body;
                this.serviceCreated = this.services.length > 0;
                endpoint.serviceId = id;
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

    save() {
        this.setDataFromForm();
        this.setOptions();
        this.setVersion();
        this.savingFlowFailed = false;
        this.savingFlowSuccess = false;
        let goToOverview = true;

        if (!this.editFlowForm.valid) {
            return;
        }

        if (!!this.flow.id) {
            this.endpoints.forEach(endpoint => {
                endpoint.flowId = this.flow.id;
            });

            this.flowService.update(this.flow).subscribe(flow => {
                this.flow = flow.body;
                const updateEndpoints = this.endpointService.updateMultiple(this.endpoints);

                updateEndpoints.subscribe(results => {
                    this.endpoints = results.body.concat();

                    if (!goToOverview) {
                        this.updateForm();
                    }
                    this.endpointService.findByFlowId(this.flow.id).subscribe(data => {
                        let endpoints = data.body;
                        endpoints = endpoints.filter(e => {
                            const s = this.endpoints.find(t => t.id === e.id);
                            if (typeof s === 'undefined') {
                                return true;
                            } else {
                                return s.id !== e.id;
                            }
                        });

                        if (endpoints.length > 0) {
                            endpoints.forEach(element => {
                                this.endpointService.delete(element.id).subscribe(
                                    r => {
                                        const y = r;
                                    },
                                    err => {
                                        const e = err;
                                    }
                                );
                            });
                        }
                    });
                    this.savingFlowSuccess = true;
                    this.isSaving = false;
                    if (goToOverview) {
                        this.router.navigate(['/']);
                    }
                });
            });
        } else {
            if (this.singleGateway) {
                this.flow.gatewayId = this.gateways[0].id;
            }

            this.flowService.create(this.flow).subscribe(
                flowUpdated => {
                    this.flow = flowUpdated.body;

                    this.endpoints.forEach(endpoint => {
                        endpoint.flowId = this.flow.id;
                    });

                    this.endpointService.createMultiple(this.endpoints).subscribe(
                        toRes => {
                            this.endpoints = toRes.body;
                            this.updateForm();
                            this.finished = true;
                            this.savingFlowSuccess = true;
                            this.isSaving = false;
                            if (goToOverview) {
                                this.router.navigate(['/']);
                            }
                        },
                        () => {
                            this.handleErrorWhileCreatingFlow(this.flow.id, this.endpoint.id);
                        }
                    );
                },
                () => {
                    this.handleErrorWhileCreatingFlow(this.flow.id, this.endpoint.id);
                }
            );
        }
    }

    setDataFromForm() {
        const flowControls = this.editFlowForm.controls;

        flowControls.name.markAsTouched();
        flowControls.name.updateValueAndValidity();

        this.flow.id = flowControls.id.value;
        this.flow.name = flowControls.name.value;
        this.flow.autoStart = flowControls.autoStart.value;
        this.flow.offLoading = flowControls.offloading.value;
        this.flow.maximumRedeliveries = flowControls.maximumRedeliveries.value;
        this.flow.redeliveryDelay = flowControls.redeliveryDelay.value;
        this.flow.logLevel = flowControls.logLevel.value;
        this.flow.gatewayId = flowControls.gateway.value;

        (<FormArray>flowControls.endpointsData).controls.forEach((endpoint, index) => {
            this.setDataFromFormOnEndpoint(this.endpoints[index], (<FormGroup>endpoint).controls);
        });
    }

    setDataFromFormOnEndpoint(endpoint, formEndpointData) {
        formEndpointData.uri.setValidators([Validators.required]);
        formEndpointData.uri.updateValueAndValidity();

        endpoint.id = formEndpointData.id.value;
        endpoint.componentType = formEndpointData.componentType.value;
        endpoint.uri = formEndpointData.uri.value;
        endpoint.serviceId = formEndpointData.service.value;
        endpoint.headerId = formEndpointData.header.value;
    }

    setVersion() {
        let now = moment();

        if (this.flow.id) {
            this.flow.version = this.flow.version + 1;
            this.flow.lastModified = now;
        } else {
            this.flow.version = 1;
            this.flow.created = now;
            this.flow.lastModified = now;
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

    setInvalidUriMessage(endpointName: string) {
        this.invalidUriMessage = `Uri for ${endpointName} is not valid.`;
        setTimeout(() => {
            this.invalidUriMessage = '';
        }, 15000);
    }

    formatUri(endpointOptions, endpoint, formEndpoint): string {
        if (formEndpoint.controls.componentType.value === null) {
            return;
        }
        let formOptions = <FormArray>formEndpoint.controls.options;
        this.setEndpointOptions(endpointOptions, endpoint, formOptions);
        return `${formEndpoint.controls.componentType.value.toLowerCase()}://${formEndpoint.controls.uri.value}${
            !endpoint.options ? '' : endpoint.options
        }`;
    }

    validateTypeAndUri(endpoint: FormGroup) {
        endpoint.controls.componentType.markAsTouched();
        endpoint.controls.uri.markAsTouched();
    }

    markAsUntouchedTypeAndUri(endpoint: FormGroup) {
        endpoint.controls.componentType.markAsUntouched();
        endpoint.controls.uri.markAsUntouched();
    }

    private subscribeToSaveResponse(result: Observable<Flow>) {
        result.subscribe(
            (res: Flow) => this.onSaveSuccess(res),
            (res: Response) => this.onSaveError()
        );
    }

    private onSaveSuccess(result: Flow) {
        this.eventManager.broadcast({ name: 'flowListModification', content: 'OK' });
        this.isSaving = false;
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}

export class Option {
    constructor(public key?: string, public value?: string) {}
}

export class TypeLinks {
    constructor(public name: string, public assimblyTypeLink: string, public camelTypeLink: string) {}
}
