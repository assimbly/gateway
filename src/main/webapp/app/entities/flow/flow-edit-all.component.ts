import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { NgbTabset, NgbTabChangeEvent, NgbAccordion, NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IGateway, Gateway } from 'app/shared/model/gateway.model';
import { IFlow, Flow, LogLevelType } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { IEndpoint, Endpoint, EndpointType } from 'app/shared/model/endpoint.model';
import { IService, Service } from 'app/shared/model/service.model';
import { IHeader, Header } from 'app/shared/model/header.model';

import { EndpointService } from '../endpoint/';
import { ServiceService } from '../service';
import { HeaderService } from '../header';
import { GatewayService } from '../gateway';

import { FormGroup, FormControl, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ComponentType, typesLinks, Components } from '../../shared/camel/component-type';
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
	endpoints: IEndpoint[] = new Array<Endpoint>();
    services: Service[];
    headers: IHeader[];

    fromEndpoint: IEndpoint;
    fromEndpointOptions: Array<Option> = [];
    errorEndpoint: IEndpoint;
    errorEndpointOptions: Array<Option> = [];
    toEndpoints: IEndpoint[] = new Array<Endpoint>();
    toEndpointsOptions: Array<Array<Option>> = [[]];
    toEndpoint: IEndpoint;

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

    toComponentTypeAssimblyLinks: Array<string> = new Array<string>();
    toComponentTypeCamelLinks: Array<string> = new Array<string>();
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
        private endpointService: EndpointService,
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

                        this.endpointService.findByFlowId(id).subscribe(endpointsData => {

                            let endpoints = endpointsData.body;

                            if (endpoints.length === 0) {
                                this.endpoints = [new Endpoint()];
                            }

                            this.endpoints = [];

                            endpoints.forEach((endpoint, i) => {
	
								if(endpoint.endpointType.valueOf()==='FROM'){

	                                this.fromEndpoint = new Endpoint(
	                                    endpoint.id,
										endpoint.endpointType,
	                                    endpoint.componentType,
	                                    endpoint.uri,
	                                    endpoint.options,
	                                    endpoint.flowId,
	                                    endpoint.serviceId,
	                                    endpoint.headerId
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
									
									
								}else if(endpoint.endpointType.valueOf()==='ERROR'){

	                                this.errorEndpoint = new Endpoint(
	                                    endpoint.id,
										endpoint.endpointType,
	                                    endpoint.componentType,
	                                    endpoint.uri,
	                                    endpoint.options,
	                                    endpoint.flowId,
	                                    endpoint.serviceId,
	                                    endpoint.headerId
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
							}else if(endpoint.endpointType.valueOf()==='TO'){

	                                if (typeof this.toEndpointsOptions[i] === 'undefined') {
	                                    this.toEndpointsOptions.push([]);
	                                }
			
	                                this.toEndpoint = new Endpoint(
	                                    endpoint.id,
										endpoint.endpointType,
	                                    endpoint.componentType,
	                                    endpoint.uri,
	                                    endpoint.options,
	                                    endpoint.flowId,
	                                    endpoint.serviceId,
	                                    endpoint.headerId
	                                );



	                                this.toEndpoints.push(this.toEndpoint);

	                                (<FormArray>this.editFlowForm.controls.endpointsData).insert(
	                                    i + 1,
	                                    this.initializeEndpointData(this.toEndpoint)
	                                );
	                                setTimeout(() => {
	                                    this.getOptions(
	                                        endpoint,
	                                        this.editFlowForm.controls.endpointsData.get((i + 1).toString()),
	                                        this.toEndpointsOptions[i]
	                                    );
	                                    this.setTypeLinks(this.toEndpoint, i + 1);
	                                }, 100);
									
									
								}

                            if (isCloning) {
                                //reset id and flow name to null
                                this.flow.id = null;
                                this.flow.name = null;
                                this.flow.endpoints = null;

                                this.fromEndpoint.id = null;
                                this.toEndpoints.forEach(toEndpoint => {
                                    toEndpoint.id = null;
                                });
                                this.errorEndpoint.id = null;

                                this.updateForm();
                            }
                        });
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

                    this.fromEndpoint = new Endpoint();
				    this.fromEndpoint.endpointType = EndpointType.FROM;
                    this.fromEndpoint.componentType = ComponentType[this.gateways[this.indexGateway].defaultFromComponentType];
                    (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.fromEndpoint));
                    this.fromEndpointOptions = [new Option()];
                    this.setTypeLinks(this.fromEndpoint, 0);

                    this.errorEndpoint = new Endpoint();
					this.errorEndpoint.endpointType = EndpointType.ERROR;
                    this.errorEndpoint.componentType = ComponentType[this.gateways[this.indexGateway].defaultErrorComponentType];
                    (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.errorEndpoint));
                    this.errorEndpointOptions = [new Option()];
                    this.setTypeLinks(this.errorEndpoint, 1);

                    this.toEndpoints = new Array<Endpoint>(new Endpoint());
                    this.toEndpoints.forEach((endpoint, i) => {
				        endpoint.endpointType = EndpointType.TO;
                        endpoint.componentType = ComponentType[this.gateways[this.indexGateway].defaultToComponentType];
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
	
		if(endpoint.endpointType.valueOf()==='TO'){
            this.toServiceType[this.toEndpoints.indexOf(endpoint)] = this.returnServiceType(endpoint.componentType);
            this.toFilterService[this.toEndpoints.indexOf(endpoint)] = this.services.filter(
                f => f.type === this.toServiceType[this.toEndpoints.indexOf(endpoint)]
            );
            if (this.toFilterService[this.toEndpoints.indexOf(endpoint)].length > 0 && endpoint.serviceId) {
                formService.setValue(this.toFilterService[this.toEndpoints.indexOf(endpoint)].find(fs => fs.id === endpoint.serviceId).id);
            }		
		}else if(endpoint.endpointType.valueOf()==='FROM'){
			this.fromServiceType = this.returnServiceType(endpoint.componentType);
            this.fromFilterService = this.services.filter(f => f.type === this.fromServiceType);
            if (this.fromFilterService.length > 0 && endpoint.serviceId) {
                formService.setValue(this.fromFilterService.find(fs => fs.id === endpoint.serviceId).id);
            }	
		}else if(endpoint.endpointType.valueOf()==='ERROR'){
            this.errorServiceType = this.returnServiceType(endpoint.componentType);
            this.errorFilterService = this.services.filter(f => f.type === this.errorServiceType);
            if (this.errorFilterService.length > 0 && endpoint.serviceId) {
                formService.setValue(this.errorFilterService.find(fs => fs.id === endpoint.serviceId).id);
            }
    	}
    }

    returnServiceType(componentType: any) {
        if (componentType === 'ACTIVEMQ') {
            return 'ActiveMQ Connection';
        } else if (componentType === 'AMAZONMQ') {
            return 'AmazonMQ Connection';
        } else if (componentType === 'SONICMQ') {
            return 'SonicMQ Connection';
        } else if (componentType === 'SQL') {
            return 'JDBC Connection';
        } else if (componentType === 'SJMS') {
            return 'MQ Connection';
        } else if (componentType === 'AMQP') {
            return 'AMQP Connection';
        } else {
            return '';
        }
    }

    setTypeLinks(endpoint: any, endpointFormIndex?, e?: Event) {
	
        const endpointForm = <FormGroup>(<FormArray>this.editFlowForm.controls.endpointsData).controls[endpointFormIndex];

		if (typeof e !== 'undefined') {
			endpoint.componentType = e;
		} else if (!endpoint.type === null) {
			endpoint.componentType = 'FILE';
		}

        let type;
		let componentType;


		type = typesLinks.find(x => x.name === endpoint.componentType.toString());

		componentType = endpoint.componentType.toString().toLowerCase();
		if (componentType === 'activemq') {
			componentType = 'jms';
		} else if (componentType === 'amazonmq') {
			componentType = 'jms';
		} else if (componentType === 'sonicmq') {
			componentType = 'sjms';
		} else if (componentType === 'wastebin') {
			componentType = 'mock';
		}

        endpointForm.controls.service.setValue('');
        this.filterServices(endpoint, endpointForm.controls.service as FormControl);


		if(endpoint.endpointType.valueOf()==='FROM'){
				
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

		}else if(endpoint.endpointType.valueOf()==='TO'){
				
            this.toComponentTypeAssimblyLinks[this.toEndpoints.indexOf(endpoint)] = this.wikiDocUrl + type.assimblyTypeLink;
            this.toComponentTypeCamelLinks[this.toEndpoints.indexOf(endpoint)] = this.camelDocUrl + type.camelTypeLink;
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

		}else if(endpoint.endpointType.valueOf()==='ERROR'){
		
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
	
        endpointForm.patchValue({ componentType: componentType.toUpperCase() });

        switch (endpointForm.controls.componentType.value) {
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
            componentType: new FormControl(endpoint.componentType, Validators.required),
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
            this.updateEndpointData(toEndpoint, endpointsData.controls[i + 1] as FormControl);
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

            endpointOptions.push(o);
        });
    }

    setOptions() {
        this.fromEndpoint.options = '';
        this.setEndpointOptions(this.fromEndpointOptions, this.fromEndpoint, this.selectOptions(0));

        this.toEndpoints.forEach((toEndpoint, i) => {
            toEndpoint.options = '';
            this.setEndpointOptions(this.toEndpointsOptions[i], toEndpoint, this.selectOptions(i + 1));
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
        toEndpoint.endpointType = EndpointType.TO;
		toEndpoint.componentType = ComponentType[this.gateways[this.indexGateway].defaultToComponentType];
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
        (<FormArray>this.editFlowForm.controls.endpointsData).removeAt(i + 1);
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

    handleErrorWhileCreatingFlow(flowId?: number, fromEndpointId?: number, errorEndpointId?: number, toEndpointId?: number) {
        if (flowId !== null) {
            this.flowService.delete(flowId);
        }
        if (fromEndpointId !== null) {
            this.endpointService.delete(fromEndpointId);
        }
        if (errorEndpointId !== null) {
            this.endpointService.delete(errorEndpointId);
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
            
			this.fromEndpoint.flowId = this.flow.id;
            this.toEndpoints.forEach(toEndpoint => {
                toEndpoint.flowId = this.flow.id;
            });
            
            this.flowService.update(this.flow).subscribe(flow => {
                this.flow = flow.body;
                const updateFromEndpoint = this.endpointService.update(this.fromEndpoint);
                const updateErrorEndpoint = this.endpointService.update(this.errorEndpoint);
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

            this.flowService.create(this.flow).subscribe(
                flowUpdated => {
                    this.flow = flowUpdated.body;

                    this.fromEndpoint.flowId = this.flow.id;

		            this.endpointService.create(this.fromEndpoint).subscribe(
		                fromRes => {
		                    this.fromEndpoint = fromRes.body;
	                        },
	                        () => {
	                            this.handleErrorWhileCreatingFlow(this.flow.id, this.fromEndpoint.id, null, null);
		            })

				    this.errorEndpoint.flowId = this.flow.id;
	
		            this.endpointService.create(this.errorEndpoint).subscribe(
		                errorRes => {
		                    this.errorEndpoint = errorRes.body;
	                        },
	                        () => {
	                            this.handleErrorWhileCreatingFlow(this.flow.id, this.errorEndpoint.id, null, null);
	                })

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
        endpoint.componentType = formEndpointData.componentType.value;
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
