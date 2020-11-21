import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { NgbTabset, NgbTabChangeEvent, NgbAccordion, NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IGateway, Gateway } from 'app/shared/model/gateway.model';
import { IFlow, Flow, LogLevelType } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { IFromEndpoint, FromEndpoint } from 'app/shared/model/from-endpoint.model';
import { IEndpoint, Endpoint } from 'app/shared/model/endpoint.model';
import { IErrorEndpoint, ErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { IService, Service } from 'app/shared/model/service.model';
import { IHeader, Header } from 'app/shared/model/header.model';

import { FromEndpointService } from '../from-endpoint/';
import { EndpointService } from '../endpoint/';
import { ErrorEndpointService } from '../error-endpoint/';
import { ServiceService } from '../service';
import { HeaderService } from '../header';
import { GatewayService } from '../gateway';

import { FormGroup, FormControl, Validators, FormArray, AbstractControl } from '@angular/forms';
import { EndpointType, typesLinks, Components } from '../../shared/camel/component-type';
import { map } from 'rxjs/operators';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { HeaderPopupService, HeaderDialogComponent } from 'app/entities/header';
import { ServicePopupService, ServiceDialogComponent } from 'app/entities/service';
import * as moment from 'moment';

@Component({
    selector: 'jhi-flow-edit-all',
    templateUrl: './flow-edit-all.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FlowEditAllComponent implements OnInit, OnDestroy {

    flow: IFlow;
    fromEndpoint: IFromEndpoint;
    fromEndpointOptions: Array<Option> = [];
    toEndpointsOptions: Array<Array<Option>> = [[]];
    errorEndpoint: IErrorEndpoint;
    errorEndpointOptions: Array<Option> = [];
    toEndpoints: IEndpoint[] = new Array<Endpoint>();
    toEndpoint: IEndpoint;
    services: Service[];
    headers: IHeader[];

    public logLevelListType = [
        LogLevelType.OFF,
        LogLevelType.INFO,
        LogLevelType.ERROR,
        LogLevelType.TRACE,
        LogLevelType.WARN,
        LogLevelType.DEBUG
    ];

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
    newId: number;
    predicate: any;
    queryCount: any;
    reverse: any;
    totalItems: number;
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
    fromPopoverMessage: string;
    toPopoverMessage: string;
    errorPopoverMessage: string;

    fromTypeAssimblyLink: string;
    fromTypeCamelLink: string;
    fromUriPlaceholder: string;
    fromUriPopoverMessage: string;

    componentOptions: any;
    fromComponentOptions: any;
    toComponentOptions: Array<any> = [];
    errorComponentOptions: any;

    toTypeAssimblyLinks: Array<string> = new Array<string>();
    toTypeCamelLinks: Array<string> = new Array<string>();
    toUriPlaceholders: Array<string> = new Array<string>();
    toUriPopoverMessages: Array<string> = new Array<string>();

    errorTypeAssimblyLink: string;
    errorTypeCamelLink: string;
    errorUriPlaceholder: string;
    errorUriPopoverMessage: string;

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
    
    
    fromFilterService: Array<Service> = [];
    fromServiceType: string;
    toFilterService: Array<Array<Service>> = [[]];
    toServiceType: Array<string> = [];
    errorFilterService: Array<Service> = [];
    errorServiceType: string;
    selectedService: Service = new Service();
    closeResult: string;

    errorSetHeader = false;

    private subscription: Subscription;
    private eventSubscriber: Subscription;
    private wikiDocUrl: string;
    private camelDocUrl: string;

    modalRef: NgbModalRef | null;

    @ViewChild('tabs', { static: false })
    private ngbTabset: NgbTabset;

    constructor(
        private eventManager: JhiEventManager,
        private gatewayService: GatewayService,
        private flowService: FlowService,
        private fromEndpointService: FromEndpointService,
        private endpointService: EndpointService,
        private errorEndpointService: ErrorEndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private jhiAlertService: JhiAlertService,
        private route: ActivatedRoute,
        private router: Router,
        public components: Components,
        private modalService: NgbModal,
        private headerPopupService: HeaderPopupService,
        private servicePopupService: ServicePopupService
    ) {
        this.toEndpoints = [new Endpoint()];
    }

    ngOnInit() {
        this.isSaving = false;
        this.createRoute = 0;
        this.setPopoverMessages();

        this.subscription = this.route.params.subscribe(params => {
            if (params['clone']) {
                this.load(params['id'], true);
            } else {
                this.load(params['id']);
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
            this.flowService.getGatewayName()
        ).subscribe(([wikiDocUrl, camelDocUrl, services, headers, gateways, gatewayName]) => {
            this.wikiDocUrl = wikiDocUrl.body;

            this.camelDocUrl = camelDocUrl.body;

            this.services = services.body;
            this.serviceCreated = this.services.length > 0;

            this.headers = headers.body;
            this.headerCreated = this.headers.length > 0;

            this.gateways = gateways.body;
            this.singleGateway = this.gateways.length === 1;
            this.gatewayName = gatewayName.body;

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

                        forkJoin(
                            this.fromEndpointService.find(this.flow.fromEndpointId),
                            this.errorEndpointService.find(this.flow.errorEndpointId),
                            this.endpointService.findByFlowId(id)
                        ).subscribe(([fromEndpoint, errorEndpoint, endpointsData]) => {
                            if (fromEndpoint) {
                                this.fromEndpoint = new FromEndpoint(
                                    fromEndpoint.body.id,
                                    fromEndpoint.body.type,
                                    fromEndpoint.body.uri,
                                    fromEndpoint.body.options,
                                    fromEndpoint.body.serviceId,
                                    fromEndpoint.body.headerId
                                );
                                (<FormArray>this.editFlowForm.controls.endpointsData).insert(
                                    0,
                                    this.initializeEndpointData(this.fromEndpoint)
                                );
                                setTimeout(() => {
                                    this.getOptions(
                                        this.fromEndpoint,
                                        this.editFlowForm.controls.endpointsData.get('0'),
                                        this.fromEndpointOptions
                                    );
                                    this.setTypeLinks(this.fromEndpoint, 0);
                                    this.finished = true;
                                }, 100);
                            }

                            this.errorEndpoint = new ErrorEndpoint(
                                errorEndpoint.body.id,
                                errorEndpoint.body.type,
                                errorEndpoint.body.uri,
                                errorEndpoint.body.options,
                                errorEndpoint.body.serviceId,
                                errorEndpoint.body.headerId
                            );
                            (<FormArray>this.editFlowForm.controls.endpointsData).insert(
                                1,
                                this.initializeEndpointData(this.errorEndpoint)
                            );
                            setTimeout(() => {
                                this.getOptions(
                                    this.errorEndpoint,
                                    this.editFlowForm.controls.endpointsData.get('1'),
                                    this.errorEndpointOptions
                                );
                                this.setTypeLinks(this.errorEndpoint, 1);
                            }, 100);

                            let toEndpoints = endpointsData.body;
                            if (toEndpoints.length === 0) {
                                this.toEndpoints = [new Endpoint()];
                            }
                            this.toEndpoints = [];
                            toEndpoints.forEach((toEndpoint, i) => {
                                if (typeof this.toEndpointsOptions[i] === 'undefined') {
                                    this.toEndpointsOptions.push([]);
                                }
                                toEndpoint = new Endpoint(
                                    toEndpoint.id,
                                    toEndpoint.type,
                                    toEndpoint.uri,
                                    toEndpoint.options,
                                    toEndpoint.flowId,
                                    toEndpoint.serviceId,
                                    toEndpoint.headerId
                                );
                                this.toEndpoints.push(toEndpoint);
                                (<FormArray>this.editFlowForm.controls.endpointsData).insert(
                                    i + 2,
                                    this.initializeEndpointData(toEndpoint)
                                );
                                setTimeout(() => {
                                    this.getOptions(
                                        toEndpoint,
                                        this.editFlowForm.controls.endpointsData.get((i + 2).toString()),
                                        this.toEndpointsOptions[i]
                                    );
                                    this.setTypeLinks(toEndpoint, i + 2);
                                }, 100);
                            });

                            if (isCloning) {
                                //reset id and flow name to null
                                this.flow.id = null;
                                this.flow.name = null;
                                this.flow.fromEndpointId = null;
                                this.flow.errorEndpointId = null;
                                this.flow.endpoints = null;

                                this.fromEndpoint.id = null;
                                this.toEndpoints.forEach(toEndpoint => {
                                    toEndpoint.id = null;
                                });
                                this.errorEndpoint.id = null;

                                this.updateForm();
                            }
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

                    this.fromEndpoint = new FromEndpoint();

                    this.fromEndpoint.type = EndpointType[this.gateways[this.indexGateway].defaultFromEndpointType];
                    (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.fromEndpoint));
                    this.fromEndpointOptions = [new Option()];
                    this.setTypeLinks(this.fromEndpoint, 0);

                    this.errorEndpoint = new ErrorEndpoint();
                    this.errorEndpoint.type = EndpointType[this.gateways[this.indexGateway].defaultErrorEndpointType];
                    (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.errorEndpoint));
                    this.errorEndpointOptions = [new Option()];
                    this.setTypeLinks(this.errorEndpoint, 1);

                    this.toEndpoints = new Array<Endpoint>(new Endpoint());
                    this.toEndpoints.forEach((endpoint, i) => {
                        endpoint.type = EndpointType[this.gateways[this.indexGateway].defaultToEndpointType];
                    });
                    (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.toEndpoints[0]));
                    this.toEndpointsOptions = [[new Option()]];
                    this.setTypeLinks(this.toEndpoints[0], 2);

                    this.finished = true;
                    this.displayNextButton = true;
                }, 0);
            }
        });
    }

    clone() {
        //reset id and flow name to null
        this.flow.id = null;
        this.flow.name = null;
        this.flow.fromEndpointId = null;
        this.flow.errorEndpointId = null;
        this.flow.endpoints = null;

        this.fromEndpoint.id = null;
        this.toEndpoints.forEach(toEndpoint => {
            toEndpoint.id = null;
        });
        this.errorEndpoint.id = null;

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
        if (endpoint instanceof Endpoint) {
            this.toServiceType[this.toEndpoints.indexOf(endpoint)] = this.returnServiceType(endpoint.type);
            this.toFilterService[this.toEndpoints.indexOf(endpoint)] = this.services.filter(
                f => f.type === this.toServiceType[this.toEndpoints.indexOf(endpoint)]
            );
            if (this.toFilterService[this.toEndpoints.indexOf(endpoint)].length > 0 && endpoint.serviceId) {
                formService.setValue(this.toFilterService[this.toEndpoints.indexOf(endpoint)].find(fs => fs.id === endpoint.serviceId).id);
            }
        } else if (endpoint instanceof FromEndpoint) {
            this.fromServiceType = this.returnServiceType(endpoint.type);
            this.fromFilterService = this.services.filter(f => f.type === this.fromServiceType);
            if (this.fromFilterService.length > 0 && endpoint.serviceId) {
                formService.setValue(this.fromFilterService.find(fs => fs.id === endpoint.serviceId).id);
            }
        } else if (endpoint instanceof ErrorEndpoint) {
            this.errorServiceType = this.returnServiceType(endpoint.type);
            this.errorFilterService = this.services.filter(f => f.type === this.errorServiceType);
            if (this.errorFilterService.length > 0 && endpoint.serviceId) {
                formService.setValue(this.errorFilterService.find(fs => fs.id === endpoint.serviceId).id);
            }
        }
    }

    returnServiceType(type: any) {
        if (type === 'ACTIVEMQ') {
            return 'ActiveMQ Connection';
        } else if (type === 'AMAZONMQ') {
            return 'AmazonMQ Connection';
        } else if (type === 'SONICMQ') {
            return 'SonicMQ Connection';
        } else if (type === 'SQL') {
            return 'JDBC Connection';
        } else if (type === 'SJMS') {
            return 'MQ Connection';
        } else if (type === 'AMQP') {
            return 'AMQP Connection';
        } else {
            return '';
        }
    }

    setTypeLinks(endpoint: any, endpointFormIndex?, e?: Event) {
        const endpointForm = <FormGroup>(<FormArray>this.editFlowForm.controls.endpointsData).controls[endpointFormIndex];
        if (typeof e !== 'undefined') {
            endpoint.type = e;
        } else if (!endpoint.type === null) {
            endpoint.type = 'FILE';
        }

        let type = typesLinks.find(x => x.name === endpoint.type.toString());
        let componentType = endpoint.type.toString().toLowerCase();
        if (componentType === 'activemq') {
            componentType = 'jms';
        } else if (componentType === 'amazonmq') {
            componentType = 'jms';
        } else if (componentType === 'sonicmq') {
            componentType = 'sjms';
        } else if (componentType === 'wastebin') {
            componentType = 'mock';
        }

        if (endpoint instanceof FromEndpoint) {
            endpointForm.controls.service.setValue('');
            this.filterServices(endpoint, endpointForm.controls.service as FormControl);
            this.fromTypeAssimblyLink = this.wikiDocUrl + type.assimblyTypeLink;
            this.fromTypeCamelLink = this.camelDocUrl + type.camelTypeLink;
            this.fromUriPlaceholder = type.uriPlaceholder;
            this.fromUriPopoverMessage = type.uriPopoverMessage;

            // get options keys
            this.getComponentOptions(componentType).subscribe(data => {

                let componentOptions = data.properties;
                
                this.fromComponentOptions = Object.keys(componentOptions).map(key => ({...componentOptions[key],...{name: key}}));                
                this.fromComponentOptions.sort(function(a, b) {
                     return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
                });                
            });
        } else if (endpoint instanceof Endpoint) {
            endpointForm.controls.service.setValue('');
            this.filterServices(endpoint, endpointForm.controls.service as FormControl);
            this.toTypeAssimblyLinks[this.toEndpoints.indexOf(endpoint)] = this.wikiDocUrl + type.assimblyTypeLink;
            this.toTypeCamelLinks[this.toEndpoints.indexOf(endpoint)] = this.camelDocUrl + type.camelTypeLink;
            this.toUriPlaceholders[this.toEndpoints.indexOf(endpoint)] = type.uriPlaceholder;
            this.toUriPopoverMessages[this.toEndpoints.indexOf(endpoint)] = type.uriPopoverMessage;

            // set options keys
            this.getComponentOptions(componentType).subscribe(data => {
                
                let componentOptions = data.properties;
                
                this.toComponentOptions[this.toEndpoints.indexOf(endpoint)] = Object.keys(componentOptions).map(key => ({...componentOptions[key],...{name: key}}));                
                this.toComponentOptions[this.toEndpoints.indexOf(endpoint)].sort(function(a, b) {
                     return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
                });
            });
        } else if (endpoint instanceof ErrorEndpoint) {
            endpointForm.controls.service.setValue('');
            this.filterServices(endpoint, endpointForm.controls.service as FormControl);
            this.errorTypeAssimblyLink = this.wikiDocUrl + type.assimblyTypeLink;
            this.errorTypeCamelLink = this.camelDocUrl + type.camelTypeLink;
            this.errorUriPlaceholder = type.uriPlaceholder;
            this.errorUriPopoverMessage = type.uriPopoverMessage;

            // set options keys
            this.getComponentOptions(componentType).subscribe(data => {
                
                let componentOptions = data.properties;
                
                this.errorComponentOptions = Object.keys(componentOptions).map(key => ({...componentOptions[key],...{name: key}}));                
                this.errorComponentOptions.sort(function(a, b) {
                     return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
                });
            });
        }

        endpointForm.patchValue({ type: type.name });

        switch (endpointForm.controls.type.value) {
            case 'WASTEBIN': {
                endpointForm.controls.uri.disable();
                endpointForm.controls.options.disable();
                endpointForm.controls.service.disable();
                endpointForm.controls.header.disable();
                break;
            }
            case 'ACTIVEMQ': {
                endpointForm.controls.uri.enable();
                endpointForm.controls.options.enable();
                endpointForm.controls.header.enable();
                if (this.embeddedBroker) {
                    endpointForm.controls.service.disable();
                } else {
                    endpointForm.controls.service.enable();
                }
                break;
            }
            case 'AMAZONMQ':
            case 'AMQP':
            case 'SJMS':
            case 'SONICMQ':
            case 'SQL': {
                endpointForm.controls.uri.enable();
                endpointForm.controls.options.enable();
                endpointForm.controls.header.enable();
                endpointForm.controls.service.enable();
                break;
            }
            default: {
                endpointForm.controls.uri.enable();
                endpointForm.controls.options.enable();
                endpointForm.controls.header.enable();
                endpointForm.controls.service.disable();
                break;
            }
        }
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
        this.headerPopoverMessage = `A group of key/value pairs to add to the message header.<br/><br/> Use the button on the right to create or edit a header.`;
        this.servicePopoverMessage = `If available then a service can be selected. For example a service that sets up a connection.<br/><br/>
                                     Use the button on the right to create or edit services.`;
        this.fromPopoverMessage = `Source of messages.`;
        this.toPopoverMessage = `Destination of messages. Multiple destinations can be configured.`;
        this.errorPopoverMessage = `Fault destination of messages.`;
        this.hostnamePopoverMessage = `URL, IP-address or DNS Name. For example camel.apache.org or 127.0.0.1`;
        this.portPopoverMessage = `Number of the port. Range between 1 and 65536`;
        this.timeoutPopoverMessage = `Timeout in seconds to wait for connection.`;
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

    initializeEndpointData(endpoint?: any): FormGroup {
        return new FormGroup({
            id: new FormControl(endpoint.id),
            type: new FormControl(endpoint.type, Validators.required),
            uri: new FormControl(endpoint.uri, Validators.required),
            options: new FormArray([this.initializeOption()]),
            header: new FormControl(endpoint.headerId),
            service: new FormControl(endpoint.serviceId, Validators.required)
        });
    }

    initializeOption(): FormGroup {
        return new FormGroup({
            key: new FormControl(null),
            value: new FormControl(null)
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
        this.updateEndpointData(this.fromEndpoint, endpointsData.controls[0] as FormControl);
        this.updateEndpointData(this.errorEndpoint, endpointsData.controls[1] as FormControl);
        this.toEndpoints.forEach((toEndpoint, i) => {
            this.updateEndpointData(toEndpoint, endpointsData.controls[i + 2] as FormControl);
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
            type: endpoint.type,
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
            const kv = option.split('=');
            const o = new Option();
            o.key = kv[0];
            o.value = kv[1];
            if (typeof endpointForm.controls.options.controls[index] === 'undefined') {
                endpointForm.controls.options.push(this.initializeOption());
            }

            endpointForm.controls.options.controls[index].patchValue({
                key: o.key,
                value: o.value
            });

            if (endpoint instanceof FromEndpoint) {
                endpointOptions.push(o);
            } else if (endpoint instanceof Endpoint) {
                endpointOptions.push(o);
            } else if (endpoint instanceof ErrorEndpoint) {
                endpointOptions.push(o);
            }
        });
    }

    setOptions() {
        this.fromEndpoint.options = '';
        this.setEndpointOptions(this.fromEndpointOptions, this.fromEndpoint, this.selectOptions(0));

        this.toEndpoints.forEach((toEndpoint, i) => {
            toEndpoint.options = '';
            this.setEndpointOptions(this.toEndpointsOptions[i], toEndpoint, this.selectOptions(i + 2));
        });

        this.errorEndpoint.options = '';
        this.setEndpointOptions(this.errorEndpointOptions, this.errorEndpoint, this.selectOptions(1));
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

    addNewToEndpoint() {
        this.toEndpoints.push(new Endpoint());
        this.toEndpointsOptions.push([new Option()]);
        const toEndpoint = this.toEndpoints.find((e, i) => i === this.toEndpoints.length - 1);
        toEndpoint.type = EndpointType[this.gateways[this.indexGateway].defaultToEndpointType];
        (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(toEndpoint));
        this.setTypeLinks(toEndpoint, 2 + this.toEndpoints.indexOf(toEndpoint));
        setTimeout(() => {
            this.ngbTabset.select(`toTab${this.toEndpoints.indexOf(toEndpoint)}`);
        }, 0);
    }
    removeToEndpoint(toEndpoint, endpointDataName) {
        const i = this.toEndpoints.indexOf(toEndpoint);
        this.toEndpoints.splice(i, 1);
        this.toEndpointsOptions.splice(i, 1);
        this.editFlowForm.removeControl(endpointDataName);
        (<FormArray>this.editFlowForm.controls.endpointsData).removeAt(i + 2);
        setTimeout(() => {
            this.ngbTabset.select(`toTab${this.toEndpoints.length - 1}`);
        }, 0);
    }

    openModal(templateRef: TemplateRef<any>) {
        this.modalRef = this.modalService.open(templateRef);
    }
    
    openTestConnectionModal(templateRef: TemplateRef<any>) {
        this.initializeTestConnectionForm();
        this.testConnectionMessage = "";
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
        this.connectionHost = (<FormGroup>this.testConnectionForm.controls.connectionHost.value);
        this.connectionPort = (<FormGroup>this.testConnectionForm.controls.connectionPort.value);
        this.connectionTimeout = (<FormGroup>this.testConnectionForm.controls.connectionTimeout.value);
        
        this.flowService.testConnection(this.flow.gatewayId, this.connectionHost, this.connectionPort, this.connectionTimeout).subscribe(result => {
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

                if (endpoint instanceof Endpoint) {
                    if (formHeader.value === null) {
                        formHeader.patchValue(id);
                    }
                    endpoint = null;
                } else if (endpoint instanceof FromEndpoint) {
                    if (formHeader.value === null) {
                        formHeader.patchValue(id);
                    }
                } else if (endpoint instanceof ErrorEndpoint) {
                    if (formHeader.value === null) {
                        formHeader.patchValue(id);
                    }
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
                endpoint.serviceId = id;
                formService.patchValue(id);
                this.filterServices(endpoint, formService);
            },
            res => this.onError(res.body)
        );
    }

    handleErrorWhileCreatingFlow(flowId?: number, fromEndpointId?: number, errorEndpointId?: number, toEndpointId?: number) {
        if (flowId !== null) {
            this.flowService.delete(flowId);
        }
        if (fromEndpointId !== null) {
            this.fromEndpointService.delete(fromEndpointId);
        }
        if (errorEndpointId !== null) {
            this.errorEndpointService.delete(errorEndpointId);
        }
        if (toEndpointId !== null) {
            this.endpointService.delete(toEndpointId);
        }
        this.savingFlowFailed = true;
        this.isSaving = false;
    }

    export(flow: IFlow) {
        this.flowService.exportFlowConfiguration(flow);
    }

    save(goToOverview: boolean) {
        this.isSaving = true;
        this.setDataFromForm();
        this.setOptions();
        this.setVersion();
        this.savingFlowFailed = false;
        this.savingFlowSuccess = false;
        
        
        if (!!this.fromEndpoint.id && !!this.errorEndpoint.id && !!this.flow.id) {
            
            this.toEndpoints.forEach(toEndpoint => {
                toEndpoint.flowId = this.flow.id;
            });
            
            this.flowService.update(this.flow).subscribe(flow => {
                this.flow = flow.body;
                const updateFromEndpoint = this.fromEndpointService.update(this.fromEndpoint);
                const updateErrorEndpoint = this.errorEndpointService.update(this.errorEndpoint);
                const updateToEndpoints = this.endpointService.updateMultiple(this.toEndpoints);

                forkJoin([updateFromEndpoint, updateErrorEndpoint, updateToEndpoints]).subscribe(results => {
                    this.fromEndpoint = results[0].body;
                    this.errorEndpoint = results[1].body;
                    this.toEndpoints = results[2].body.concat();

                    if (!goToOverview) {
                        this.updateForm();
                    }
                    this.endpointService.findByFlowId(this.flow.id).subscribe(data => {
                        let toEndpoints = data.body;
                        toEndpoints = toEndpoints.filter(e => {
                            const s = this.toEndpoints.find(t => t.id === e.id);
                            if (typeof s === 'undefined') {
                                return true;
                            } else {
                                return s.id !== e.id;
                            }
                        });

                        if (toEndpoints.length > 0) {
                            toEndpoints.forEach(element => {
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

            this.fromEndpointService.create(this.fromEndpoint).subscribe(
                fromRes => {
                    this.fromEndpoint = fromRes.body;
                    this.errorEndpointService.create(this.errorEndpoint).subscribe(
                        errorRes => {
                            this.errorEndpoint = errorRes.body;
                            this.flow.fromEndpointId = this.fromEndpoint.id;
                            this.flow.errorEndpointId = this.errorEndpoint.id;
                            this.flowService.create(this.flow).subscribe(
                                flowUpdated => {
                                    this.flow = flowUpdated.body;
                                    this.toEndpoints.forEach(toEndpoint => {
                                        toEndpoint.flowId = this.flow.id;
                                    });
                                    this.endpointService.createMultiple(this.toEndpoints).subscribe(
                                        toRes => {
                                            this.toEndpoints = toRes.body;
                                            this.updateForm();
                                            this.finished = true;
                                            this.savingFlowSuccess = true;
                                            this.isSaving = false;
                                            if (goToOverview) {
                                                this.router.navigate(['/']);
                                            }
                                        },
                                        () => {
                                            this.handleErrorWhileCreatingFlow(
                                                this.flow.id,
                                                this.fromEndpoint.id,
                                                this.errorEndpoint.id,
                                                null
                                            );
                                        }
                                    );
                                },
                                () => {
                                    this.handleErrorWhileCreatingFlow(this.flow.id, this.fromEndpoint.id, null, null);
                                }
                            );
                        },
                        () => {
                            this.handleErrorWhileCreatingFlow(this.flow.id, this.fromEndpoint.id, null, null);
                        }
                    );
                },
                () => {
                    this.handleErrorWhileCreatingFlow(this.flow.id, null, null, null);
                }
            );
        }
    }

    setDataFromForm() {
        const flowControls = this.editFlowForm.controls;
        this.flow.id = flowControls.id.value;
        this.flow.name = flowControls.name.value;
        this.flow.autoStart = flowControls.autoStart.value;
        this.flow.offLoading = flowControls.offloading.value;
        this.flow.maximumRedeliveries = flowControls.maximumRedeliveries.value;
        this.flow.redeliveryDelay = flowControls.redeliveryDelay.value;
        this.flow.logLevel = flowControls.logLevel.value;
        this.flow.gatewayId = flowControls.gateway.value;

        (<FormArray>flowControls.endpointsData).controls.forEach((endpoint, index) => {
            if (index === 0) {
                this.setDataFromFormOnEndpoint(this.fromEndpoint, (<FormGroup>endpoint).controls);
            } else if (index === 1) {
                this.setDataFromFormOnEndpoint(this.errorEndpoint, (<FormGroup>endpoint).controls);
            } else if (index > 1) {
                this.setDataFromFormOnEndpoint(this.toEndpoints[index - 2], (<FormGroup>endpoint).controls);
            }
        });
    }

    setDataFromFormOnEndpoint(endpoint, formEndpointData) {
        endpoint.id = formEndpointData.id.value;
        endpoint.type = formEndpointData.type.value;
        endpoint.uri = formEndpointData.uri.value;
        endpoint.serviceId = formEndpointData.service.value;
        endpoint.headerId = formEndpointData.header.value;
    }

    setVersion() {
        
        let now = moment();
        
        if(this.flow.id){
            this.flow.version = this.flow.version + 1;
            this.flow.lastModified = now;
        }else{
            this.flow.version = 1;
            this.flow.created = now;
            this.flow.lastModified = now;
        }
        
    }
    
    goBack() {
        window.history.back();
    }

    next(nextClicked: boolean, isNextTab?: boolean, e?: NgbTabChangeEvent) {
        const activeTab = this.ngbTabset.tabs.find(t => t.id === this.ngbTabset.activeId);
        const index = this.ngbTabset.tabs['_results'].indexOf(activeTab);
        const endpoints = (<FormArray>this.editFlowForm.controls.endpointsData).controls;
        if (index === 0) {
            let endpoint = <FormGroup>endpoints[index];
            this.validateTypeAndUri(endpoint);
            if (endpoints[index].valid) {
                this.flowService
                    .validateFlowsUri(
                        this.editFlowForm.controls.gateway.value,
                        this.formatUri(this.fromEndpointOptions, this.fromEndpoint, endpoint)
                    )
                    .subscribe(
                        () => {
                            if (nextClicked) {
                                this.goToNextTab(endpoints, index + 1);
                            }
                        },
                        () => {
                            this.setInvalidUriMessage('FromEndpoint');
                            if (nextClicked) {
                                this.goToNextTab(endpoints, index + 1);
                            }
                        }
                    );
            } else if (isNextTab) {
                this.markAsUntouchedTypeAndUri(<FormGroup>endpoints[index]);
            } else {
                e.preventDefault();
            }
        } else if (index === this.ngbTabset.tabs.length - 1) {
            let formEndpoint = <FormGroup>endpoints[index];
            this.validateTypeAndUri(formEndpoint);
            if (endpoints[1].valid) {
                this.flowService
                    .validateFlowsUri(
                        this.editFlowForm.controls.gateway.value,
                        this.formatUri(this.errorEndpointOptions, this.errorEndpoint, formEndpoint)
                    )
                    .subscribe(
                        () => {
                            if (nextClicked) {
                                this.goToNextTab(endpoints, 0);
                            }
                        },
                        () => {
                            this.setInvalidUriMessage('ErrorEndpoint');
                            if (nextClicked) {
                                this.goToNextTab(endpoints, 0);
                            }
                        }
                    );
            } else if (isNextTab) {
                this.markAsUntouchedTypeAndUri(<FormGroup>endpoints[index]);
            } else {
                e.preventDefault();
            }
        } else {
            let endpoint = <FormGroup>endpoints[index + 1];
            this.validateTypeAndUri(endpoint);
            if (endpoints[index + 1].valid) {
                this.flowService
                    .validateFlowsUri(
                        this.editFlowForm.controls.gateway.value,
                        this.formatUri(this.toEndpointsOptions[index - 1], this.toEndpoints[index - 1], endpoint)
                    )
                    .subscribe(
                        () => {
                            if (nextClicked) {
                                this.goToNextTab(endpoints, index + 1);
                            }
                        },
                        () => {
                            this.setInvalidUriMessage(`ToEndpoint (${index})`);
                            if (nextClicked) {
                                this.goToNextTab(endpoints, index + 1);
                            }
                        }
                    );
            } else if (isNextTab) {
                this.markAsUntouchedTypeAndUri(<FormGroup>endpoints[index + 1]);
            } else {
                e.preventDefault();
            }
        }
    }

    setInvalidUriMessage(endpointName: string) {
        this.invalidUriMessage = `Uri for ${endpointName} is not valid.`;
        setTimeout(() => {
            this.invalidUriMessage = '';
        }, 15000);
    }

    goToNextTab(endpoints: AbstractControl[], index) {
        this.ngbTabset.select(this.ngbTabset.tabs['_results'][index].id);
        if (endpoints.find(e => !e.valid)) {
            this.displayNextButton = true;
            this.next(true, true);
        } else {
            this.displayNextButton = false;
        }
    }

    formatUri(endpointOptions, endpoint, formEndpoint): string {
        if (formEndpoint.controls.type.value === null) {
            return;
        }
        let formOptions = <FormArray>formEndpoint.controls.options;
        this.setEndpointOptions(endpointOptions, endpoint, formOptions);
        return `${formEndpoint.controls.type.value.toLowerCase()}://${formEndpoint.controls.uri.value}${
            !endpoint.options ? '' : endpoint.options
        }`;
    }

    validateTypeAndUri(endpoint: FormGroup) {
        endpoint.controls.type.markAsTouched();
        endpoint.controls.uri.markAsTouched();
    }

    markAsUntouchedTypeAndUri(endpoint: FormGroup) {
        endpoint.controls.type.markAsUntouched();
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
