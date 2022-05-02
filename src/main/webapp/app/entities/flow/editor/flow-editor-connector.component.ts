import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'app/core/util/alert.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { HeaderDialogComponent } from 'app/entities/header/header-dialog.component';
import { HeaderPopupService } from 'app/entities/header/header-popup.service';
import { RouteDialogComponent } from 'app/entities/route/route-dialog.component';
import { RoutePopupService } from 'app/entities/route/route-popup.service';
import { ServiceDialogComponent } from 'app/entities/service/service-dialog.component';
import { ServicePopupService } from 'app/entities/service/service-popup.service';
import { Components } from 'app/shared/camel/component-type';
import { Services } from 'app/shared/camel/service-connections';
import { Endpoint, EndpointType, IEndpoint } from 'app/shared/model/endpoint.model';
import { Flow, IFlow, LogLevelType } from 'app/shared/model/flow.model';
import { Gateway } from 'app/shared/model/gateway.model';
import { IHeader } from 'app/shared/model/header.model';
import { Route } from 'app/shared/model/route.model';
import { Service } from 'app/shared/model/service.model';
import dayjs from 'dayjs/esm';
import { forkJoin, from, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { EndpointService } from '../../endpoint/endpoint.service';
import { GatewayService } from '../../gateway/gateway.service';
import { HeaderService } from '../../header/header.service';
import { RouteService } from '../../route/route.service';
import { ServiceService } from '../../service/service.service';
import { FlowService } from '../flow.service';

@Component({
  selector: 'jhi-flow-editor-connector',
  templateUrl: './flow-editor-connector.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class FlowEditorConnectorComponent implements OnInit, OnDestroy {
  flow: IFlow;
  headers: IHeader[];
  routes: Route[];
  services: Service[];

  endpointsOptions: Array<Array<Option>> = [[]];
  URIList: Array<Array<Endpoint>> = [[]];
  allendpoints: IEndpoint[] = new Array<Endpoint>();
  endpoints: IEndpoint[] = new Array<Endpoint>();
  endpoint: IEndpoint;

  public endpointTypes = ['FROM', 'TO', 'ERROR']; // Dont include RESPONSE here!

  public logLevelListType = [
    LogLevelType.OFF,
    LogLevelType.INFO,
    LogLevelType.ERROR,
    LogLevelType.TRACE,
    LogLevelType.WARN,
    LogLevelType.DEBUG,
  ];

  panelCollapsed: any = 'uno';
  public isCollapsed = true;
  active;
  active2;
  disabled = true;
  activeEndpoint: any;

  isSaving: boolean;
  savingFlowFailed = false;
  savingFlowFailedMessage = 'Saving failed (check logs)';
  savingFlowSuccess = false;
  savingFlowSuccessMessage = 'Flow successfully saved';
  savingCheckEndpoints = true;

  finished = false;

  gateways: Gateway[];
  configuredGateway: Gateway;
  gatewayName: string;
  singleGateway = false;
  indexGateway: number;

  embeddedBroker = false;
  createRoute: number;
  predicate: any;
  reverse: any;

  headerCreated: boolean;
  routeCreated: boolean;
  serviceCreated: boolean;

  namePopoverMessage: string;
  notesPopoverMessage: string;
  autoStartPopoverMessage: string;
  assimblyHeadersPopoverMessage: string;
  parallelProcessingPopoverMessage: string;
  maximumRedeliveriesPopoverMessage: string;
  redeliveryDelayPopoverMessage: string;
  logLevelPopoverMessage: string;

  componentPopoverMessage: string;
  optionsPopoverMessage: string;
  headerPopoverMessage: string;
  routePopoverMessage: string;
  servicePopoverMessage: string;
  popoverMessage: string;

  selectedComponentType: string;
  selectedOptions: Array<Array<any>> = [[]];
  componentOptions: Array<any> = [];
  customOptions: Array<any> = [];

  componentTypeAssimblyLinks: Array<string> = new Array<string>();
  componentTypeCamelLinks: Array<string> = new Array<string>();
  uriPlaceholders: Array<string> = new Array<string>();
  uriPopoverMessages: Array<string> = new Array<string>();

  consumerComponentsNames: Array<any> = [];
  producerComponentsNames: Array<any> = [];

  typesLinks: Array<TypeLinks>;
  editFlowForm: FormGroup;
  displayNextButton = false;
  invalidUriMessage: string;
  notUniqueUriMessage: string;

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

  numberOfFromEndpoints = 0;
  numberOfToEndpoints = 0;
  numberOfResponseEndpoints = 0;

  modalRef: NgbModalRef | null;

  private subscription: Subscription;
  private eventSubscriber: Subscription;
  private wikiDocUrl: string;
  private camelDocUrl: string;

  constructor(
    private eventManager: EventManager,
    private gatewayService: GatewayService,
    private flowService: FlowService,
    private endpointService: EndpointService,
    private headerService: HeaderService,
    private routeService: RouteService,
    private serviceService: ServiceService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    public servicesList: Services,
    public components: Components,
    private modalService: NgbModal,
    private headerPopupService: HeaderPopupService,
    private routePopupService: RoutePopupService,
    private servicePopupService: ServicePopupService
  ) {}

  ngOnInit(): void {

    this.isSaving = false;
    this.createRoute = 0;

    this.setPopoverMessages();

    this.setComponents();

    this.subscription = this.route.params.subscribe(params => {

	  this.activeEndpoint = params['endpointid'];

      if (params['mode'] === 'clone') {
        this.load(params['id'], true);
      } else {
        this.load(params['id'], false);
      }
    });

    this.registerChangeInFlows();
  }

  load(id, isCloning?: boolean) : void {
    forkJoin([
      this.flowService.getWikiDocUrl(),
      this.flowService.getCamelDocUrl(),
      this.headerService.getAllHeaders(),
      this.routeService.getAllRoutes(),
      this.serviceService.getAllServices(),
      this.gatewayService.query(),
      this.endpointService.query(),
      this.flowService.getGatewayName(),
    ]).subscribe(([wikiDocUrl, camelDocUrl, headers, routes, services, gateways, allendpoints, gatewayName]) => {
      this.wikiDocUrl = wikiDocUrl.body;

      this.camelDocUrl = camelDocUrl.body;

      this.headers = headers.body;
      this.headerCreated = this.headers.length > 0;

      this.routes = routes.body;
      this.routeCreated = this.routes.length > 0;

      this.services = services.body;
      this.serviceCreated = this.services.length > 0;

      this.gateways = gateways.body;
      this.singleGateway = this.gateways.length === 1;
      this.gatewayName = gatewayName.body;

      this.allendpoints = allendpoints.body;

      if (this.singleGateway) {
        this.indexGateway = 0;
        if (this.gateways[this.indexGateway].type.valueOf().toLocaleLowerCase() === 'broker') {
          this.embeddedBroker = true;
        }
      } else {
        this.indexGateway = this.gateways.findIndex(gateway => gateway.name === this.gatewayName);
        if (this.gateways[this.indexGateway].type.valueOf().toLocaleLowerCase() === 'broker') {
          this.embeddedBroker = true;
        }
      }

      if (id) {
        this.flowService.find(id).subscribe(flow => {

            this.flow = flow.body;
            if (this.singleGateway) {
              this.flow.gatewayId = this.gateways[this.indexGateway].id;
            }

            this.initializeForm(this.flow);

            this.endpointService.findByFlowId(id).subscribe(flowEndpointsData => {
              const endpoints = flowEndpointsData.body;
              let index = 0;
              this.endpoints = [];

              this.endpointTypes.forEach((endpointType, j) => {
                let filteredEndpoints = endpoints.filter(endpoint => endpoint.endpointType === endpointType);

                const filteredEndpointsWithResponse = new Array<Endpoint>();

                // add response endpoints
                filteredEndpoints.forEach(endpoint => {
                  filteredEndpointsWithResponse.push(endpoint);
                  if (endpoint.responseId !== undefined) {
                    endpoints.filter(ep => {
                      if (ep.endpointType === 'RESPONSE' && ep.responseId === endpoint.responseId) {
                        this.numberOfResponseEndpoints += 1;
                        filteredEndpointsWithResponse.push(ep);
                      }
                    });
                  }
                });
                filteredEndpoints = filteredEndpointsWithResponse;

                filteredEndpoints.forEach((endpoint) => {
                  if (typeof this.endpointsOptions[index] === 'undefined') {
                    this.endpointsOptions.push([]);
                  }

                  this.endpoint = new Endpoint(
                    endpoint.id,
                    endpoint.endpointType,
                    endpoint.componentType,
                    endpoint.uri,
                    endpoint.options,
                    endpoint.responseId,
                    endpoint.flowId,
                    endpoint.serviceId,
                    endpoint.headerId,
                    endpoint.routeId
                  );

                  this.endpoints.push(endpoint);

                  const formgroup = this.initializeEndpointData(endpoint);
                  (<FormArray>this.editFlowForm.controls.endpointsData).insert(index, formgroup);

                  this.setTypeLinks(endpoint, index);

                  this.getOptions(
                    endpoint,
                    this.editFlowForm.controls.endpointsData.get(index.toString()),
                    this.endpointsOptions[index],
                    index
                  );

                  if (this.endpoint.endpointType === 'FROM') {
                    this.numberOfFromEndpoints = this.numberOfFromEndpoints + 1;
                  } else if (this.endpoint.endpointType === 'TO') {
                    this.numberOfToEndpoints = this.numberOfToEndpoints + 1;
                  }

                  index = index + 1;
                }, this);

              }, this);

       		  if (this.activeEndpoint) {
					const activeIndex = this.endpoints.findIndex(item => item.id.toString() === this.activeEndpoint);
					if (activeIndex === -1) {
					  this.active = '0';
					} else {
					  this.active = activeIndex.toString();
					}
				}else {
					this.active = '0';
			  }

              if (isCloning) {
                this.clone();
              }

              this.finished = true;
            });

        });
      } else if (!this.finished) {
        setTimeout(() => {
          // create new flow object
          this.flow = new Flow();
		  this.flow.type = 'connector';
          this.flow.notes = '';
          this.flow.autoStart = false;
          this.flow.parallelProcessing = true;
          this.flow.assimblyHeaders = true;
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

          // create new from endpoint
          this.endpoint = new Endpoint();
          this.endpoint.endpointType = EndpointType.FROM;
          this.endpoint.componentType = this.gateways[this.indexGateway].defaultFromComponentType.toLowerCase();

          (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.endpoint));
          this.endpointsOptions[0] = [new Option()];

          // set documentation links
          this.setTypeLinks(this.endpoint, 0);

          let componentType = this.endpoint.componentType.toLowerCase();
          let camelComponentType = this.components.getCamelComponentType(componentType);

          // get list of options (from CamelCatalog)
          this.setComponentOptions(this.endpoint, camelComponentType);

          this.numberOfFromEndpoints = 1;

          const optionArrayFrom: Array<string> = [];
          optionArrayFrom.splice(0, 0, '');
          this.selectedOptions.splice(0, 0, optionArrayFrom);

          this.endpoints.push(this.endpoint);

          // create new to endpoint
          this.endpoint = new Endpoint();
          this.endpoint.endpointType = EndpointType.TO;
          this.endpoint.componentType = this.gateways[this.indexGateway].defaultToComponentType.toLowerCase();
          (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.endpoint));
          this.endpointsOptions[1] = [new Option()];

          this.setTypeLinks(this.endpoint, 1);
          componentType = this.endpoint.componentType.toLowerCase();
          camelComponentType = this.components.getCamelComponentType(componentType);

          this.setComponentOptions(this.endpoint, camelComponentType);

          this.numberOfToEndpoints = 1;

          const optionArrayTo: Array<string> = [];
          optionArrayTo.splice(0, 0, '');
          this.selectedOptions.splice(1, 0, optionArrayTo);

          this.endpoints.push(this.endpoint);

          // create new error endpoint
          this.endpoint = new Endpoint();
          this.endpoint.endpointType = EndpointType.ERROR;
          this.endpoint.componentType = this.gateways[this.indexGateway].defaultErrorComponentType.toLowerCase();
          (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.endpoint));
          this.endpointsOptions[2] = [new Option()];
          this.setTypeLinks(this.endpoint, 2);

          componentType = this.endpoint.componentType.toLowerCase();
          camelComponentType = this.components.getCamelComponentType(componentType);
          this.setComponentOptions(this.endpoint, camelComponentType);

          const optionArrayError: Array<string> = [];
          optionArrayError.splice(0, 0, '');
          this.selectedOptions.splice(2, 0, optionArrayError);

          this.endpoints.push(this.endpoint);

          this.finished = true;
          this.displayNextButton = true;
        }, 0);
      }

      this.active = '0';
    });
  }

  setComponents(): void {
    const producerComponents = this.components.types.filter(function (component) {
      return component.consumerOnly === false;
    });

    const consumerComponents = this.components.types.filter(function (component) {
      return component.producerOnly === false;
    });

    this.producerComponentsNames = producerComponents.map(component => component.name);
    this.producerComponentsNames.sort();

    this.consumerComponentsNames = consumerComponents.map(component => component.name);
    this.consumerComponentsNames.sort();
  }

  clone(): void {
    // reset id and flow name to null
    this.flow.id = null;
    this.flow.name = null;
    this.flow.endpoints = null;

    this.endpoints.forEach((endpoint) => {
      endpoint.id = null;
    });

    this.updateForm();

    const scrollToTop = window.setInterval(() => {
      const pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 20); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }

  // this filters services not of the correct type
  filterServices(endpoint: any, formService: FormControl): void {
    this.serviceType[this.endpoints.indexOf(endpoint)] = this.servicesList.getServiceType(endpoint.componentType);
    this.filterService[this.endpoints.indexOf(endpoint)] = this.services.filter(
      f => f.type === this.serviceType[this.endpoints.indexOf(endpoint)]
    );

    if (this.filterService[this.endpoints.indexOf(endpoint)].length > 0 && endpoint.serviceId) {
      formService.setValue(this.filterService[this.endpoints.indexOf(endpoint)].find(fs => fs.id === endpoint.serviceId).id);
    }
  }

  setTypeLinks(endpoint: any, endpointFormIndex?, e?: Event): void {
    const endpointForm = <FormGroup>(<FormArray>this.editFlowForm.controls.endpointsData).controls[endpointFormIndex];

    if (typeof e !== 'undefined') {
      // set componenttype to selected component and clear other fields
      endpoint.componentType = e;
      endpoint.uri = null;
      endpoint.headerId = '';
      endpoint.routeId = '';
      endpoint.serviceId = '';

      let i;
      const numberOfOptions = this.endpointsOptions[endpointFormIndex].length - 1;
      for (i = numberOfOptions; i > 0; i--) {
        this.endpointsOptions[endpointFormIndex][i] = null;
        this.removeOption(this.endpointsOptions[endpointFormIndex], this.endpointsOptions[endpointFormIndex][i], endpointFormIndex);
      }

      endpointForm.controls.uri.patchValue(endpoint.uri);
      (<FormArray>endpointForm.controls.options).controls[0].patchValue({
        key: null,
        value: null,
      });
      endpointForm.controls.header.patchValue(endpoint.headerId);
      endpointForm.controls.route.patchValue(endpoint.routeId);
      endpointForm.controls.service.patchValue(endpoint.serviceId);
    } else if (!endpoint.componentType) {
      endpoint.componentType = 'file';
    }

    this.selectedComponentType = endpoint.componentType.toString();

    const componentType = endpoint.componentType.toString().toLowerCase();
    const camelComponentType = this.components.getCamelComponentType(componentType);

    const type = this.components.types.find(component => component.name === componentType);
    const camelType = this.components.types.find(component => component.name === camelComponentType);

    this.filterServices(endpoint, endpointForm.controls.service as FormControl);

    this.componentTypeAssimblyLinks[endpointFormIndex] = this.wikiDocUrl + '/component-' + componentType;
    this.componentTypeCamelLinks[endpointFormIndex] = this.camelDocUrl + '/' + camelComponentType + '-component.html';

    this.uriPlaceholders[endpointFormIndex] = type.syntax;
    this.uriPopoverMessages[endpointFormIndex] = type.description;

    // set options keys
    if (typeof e !== 'undefined') {
      this.setComponentOptions(endpoint, camelComponentType).subscribe(data => {
        // add custom options if available
        this.customOptions.forEach(customOption => {
          if (customOption.componentType === camelComponentType) {
            this.componentOptions[endpointFormIndex].push(customOption);
          }
        });
      });
    }

    endpointForm.patchValue({ string: componentType });

    this.enableFields(endpointForm);

    this.setURIlist(endpointFormIndex);
  }

  setPopoverMessages(): void {
    this.namePopoverMessage = `Name of the flow. Usually the name of the message type like <i>order</i>.<br/><br>Displayed on the <i>flows</i> page.`;
    this.notesPopoverMessage = `Notes to document the flow.`;
    this.autoStartPopoverMessage = `If true then the flow starts automatically when the gateway starts.`;
    this.assimblyHeadersPopoverMessage = `If true then message headers like timestamp, uri, flowid and correlationid are set. These headers start with Assimbly and can be used for logging purposes. `;
    this.parallelProcessingPopoverMessage = `If true then to endpoints are processed in parallel.`;
    this.maximumRedeliveriesPopoverMessage = `The maximum times a messages is redelivered in case of failure.<br/><br/>`;
    this.redeliveryDelayPopoverMessage = `The delay in miliseconds between redeliveries (this delays all messages!)`;
    this.logLevelPopoverMessage = `Sets the log level (default=OFF). This logs incoming and outgoing messages in the flow.`;
    this.componentPopoverMessage = `The Apache Camel scheme to use. Click on the Apache Camel or Assimbly button for online documentation on the selected scheme.`;
    this.optionsPopoverMessage = `Options for the selected component. You can add one or more key/value pairs.<br/><br/>
                                     Click on the Apache Camel button to view documation on the valid options.`;
    this.optionsPopoverMessage = ``;
    this.headerPopoverMessage = `A group of key/value pairs to add to the message header.<br/><br/> Use the button on the right to create or edit a header.`;
    this.routePopoverMessage = `A Camel route defined in XML.<br/><br/>`;
    this.servicePopoverMessage = `If available then a service can be selected. For example a service that sets up a connection.<br/><br/>
                                     Use the button on the right to create or edit services.`;
    this.popoverMessage = `Destination`;
    this.hostnamePopoverMessage = `URL, IP-address or DNS Name. For example camel.apache.org or 127.0.0.1`;
    this.portPopoverMessage = `Number of the port. Range between 1 and 65536.`;
    this.timeoutPopoverMessage = `Timeout in seconds to wait for connection.`;
  }

  setURIlist(index): void {
    this.URIList[index] = [];

    const tEndpointsUnique = this.allendpoints.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

    tEndpointsUnique.forEach((endpoint) => {
	   if(endpoint.endpointType === 'FROM' ||
		  endpoint.endpointType === 'TO'   ||
		  endpoint.endpointType === 'ERROR'   ||
		  endpoint.endpointType === 'RESPONSE'){
		  if (endpoint.componentType && this.selectedComponentType === endpoint.componentType.toLowerCase()) {
				this.URIList[index].push(endpoint);
		  }
  	    }
    });

    this.URIList.sort();
  }

  enableFields(endpointForm): void {
    const componentHasService = this.servicesList.getServiceType(endpointForm.controls.componentType.value);

    if (endpointForm.controls.componentType.value === 'wastebin') {
      endpointForm.controls.uri.disable();
      endpointForm.controls.options.disable();
      endpointForm.controls.header.disable();
      endpointForm.controls.route.disable();
      endpointForm.controls.service.disable();
    } else if (componentHasService) {
      endpointForm.controls.uri.enable();
      endpointForm.controls.options.enable();
      endpointForm.controls.header.enable();
      endpointForm.controls.route.enable();
      endpointForm.controls.service.enable();
    } else {
      endpointForm.controls.uri.enable();
      endpointForm.controls.options.enable();
      endpointForm.controls.header.enable();
      endpointForm.controls.route.enable();
      endpointForm.controls.service.disable();
    }
  }

  initializeForm(flow: Flow): void {
    this.editFlowForm = new FormGroup({
      id: new FormControl(flow.id),
      name: new FormControl(flow.name, Validators.required),
      notes: new FormControl(flow.notes),
      autoStart: new FormControl(flow.autoStart),
      assimblyHeaders: new FormControl(flow.assimblyHeaders),
      parallelProcessing: new FormControl(flow.parallelProcessing),
      maximumRedeliveries: new FormControl(flow.maximumRedeliveries),
      redeliveryDelay: new FormControl(flow.redeliveryDelay),
      logLevel: new FormControl(flow.logLevel),
      gateway: new FormControl(flow.gatewayId),
      endpointsData: new FormArray([]),
    });
  }

  initializeEndpointData(endpoint: Endpoint): FormGroup {
    return new FormGroup({
      id: new FormControl(endpoint.id),
      componentType: new FormControl(endpoint.componentType, Validators.required),
      uri: new FormControl(endpoint.uri),
      options: new FormArray([this.initializeOption()]),
      header: new FormControl(endpoint.headerId),
      route: new FormControl(endpoint.routeId),
      service: new FormControl(endpoint.serviceId, Validators.required),
    });
  }

  initializeOption(): FormGroup {
    return new FormGroup({
      key: new FormControl(null),
      value: new FormControl(null),
      defaultValue: new FormControl(''),
    });
  }

  initializeTestConnectionForm(): void {
    this.testConnectionForm = new FormGroup({
      connectionHost: new FormControl(null, Validators.required),
      connectionPort: new FormControl(80),
      connectionTimeout: new FormControl(10),
    });
  }

  updateForm(): void {
    this.updateFlowData(this.flow);

    const endpointsData = this.editFlowForm.controls.endpointsData as FormArray;
    this.endpoints.forEach((endpoint, i) => {
      this.updateEndpointData(endpoint, endpointsData.controls[i] as FormControl);
    });
  }

  updateFlowData(flow: Flow): void {
    this.editFlowForm.patchValue({
      id: flow.id,
      name: flow.name,
      notes: flow.notes,
      autoStart: flow.autoStart,
      assimblyHeaders: flow.assimblyHeaders,
      parallelProcessing: flow.parallelProcessing,
      maximumRedeliveries: flow.maximumRedeliveries,
      redeliveryDelay: flow.redeliveryDelay,
      logLevel: flow.logLevel,
      gateway: flow.gatewayId,
    });
  }

  updateEndpointData(endpoint: any, endpointData: FormControl): void {
    endpointData.patchValue({
      id: endpoint.id,
      endpointType: endpoint.endpointType,
      componentType: endpoint.componentType,
      uri: endpoint.uri,
      header: endpoint.headerId,
      route: endpoint.routeId,
      service: endpoint.serviceId,
      responseId: endpoint.responseId,
    });
  }

  setComponentOptions(endpoint: Endpoint, componentType: string): Observable<any> {
    return from(
      new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          this.getComponentOptions(componentType).subscribe(data => {
            const componentOptions = data.properties;

            this.componentOptions[this.endpoints.indexOf(endpoint)] = Object.keys(componentOptions).map(key => ({
              ...componentOptions[key],
              ...{ name: key },
            }));
            this.componentOptions[this.endpoints.indexOf(endpoint)].sort(function (a, b) {
              return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
            });

            resolve();
          });
        }, 10);
      })
    );
  }

  getComponentOptions(componentType: string): any {
    return this.flowService.getComponentOptions(1, componentType).pipe(
      map(options => options.body)
    );
  }

  getOptions(endpoint: Endpoint, endpointForm: any, endpointOptions: Array<Option>, index: number): void {
    const optionArray: Array<string> = [];

    if (!endpoint.options) {
      endpoint.options = '';
    }

    const componentType = endpoint.componentType.toLowerCase();
    const camelComponentType = this.components.getCamelComponentType(componentType);

    this.setComponentOptions(endpoint, camelComponentType).subscribe(data => {

	  let options: Array<string> = [];

	  if(endpoint.options.includes('&')){
		options = endpoint.options.match(/[^&]+(?:&&[^&]+)*/g);
	  }else{
		options = endpoint.options.split('&');
	  }

      options.forEach((option, optionIndex) => {
        const o = new Option();

        if (typeof endpointForm.controls.options.controls[optionIndex] === 'undefined') {
          endpointForm.controls.options.push(this.initializeOption());
        }

        if (option.includes('=')) {
          o.key = option.split('=')[0];
          o.value = option.split('=').slice(1).join('=');
        } else {
          o.key = null;
          o.value = null;
        }

        optionArray.splice(optionIndex, 0, o.key);

        endpointForm.controls.options.controls[optionIndex].patchValue({
          key: o.key,
          value: o.value,
        });

        if (this.componentOptions[index]) {
          const optionNameExist = this.componentOptions[index].some(el => el.name === o.key);

          if (!optionNameExist && o.key) {
            this.componentOptions[index].push({
              name: o.key,
              displayName: o.key,
              description: 'Custom option',
              group: 'custom',
              type: 'string',
              componentType: camelComponentType,
            });
            this.customOptions.push({
              name: o.key,
              displayName: o.key,
              description: 'Custom option',
              group: 'custom',
              type: 'string',
              componentType: camelComponentType,
            });
          }
        }

        endpointOptions.push(o);
      });
    });

    this.selectedOptions.splice(index, 0, optionArray);
  }

  setOptions(): void {
    this.endpoints.forEach((endpoint, i) => {
      endpoint.options = '';
      this.setEndpointOptions(this.endpointsOptions[i], endpoint, this.selectOptions(i));
    });
  }

  setEndpointOptions(endpointOptions: Array<Option>, endpoint, formOptions: FormArray): void {
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

  addOption(options: Array<Option>, endpointIndex): void {
    this.selectOptions(endpointIndex).push(this.initializeOption());

    options.push(new Option());
  }

  removeOption(options: Array<Option>, option: Option, endpointIndex): void {
    const optionIndex = options.indexOf(option);
    const formOptions: FormArray = this.selectOptions(endpointIndex);

    // remove from form
    formOptions.removeAt(optionIndex);
    formOptions.updateValueAndValidity();

    // remove from arrays
    options.splice(optionIndex, 1);
    this.selectedOptions[endpointIndex].splice(optionIndex, 1);
  }

  selectOptions(endpointIndex): FormArray {
    const endpointData = (<FormArray>this.editFlowForm.controls.endpointsData).controls[endpointIndex];
    return <FormArray>(<FormGroup>endpointData).controls.options;
  }

  changeOptionSelection(selectedOption, index, optionIndex, endpoint): void {
    let defaultValue;
    const componentOption = this.componentOptions[index].filter(option => option.name === selectedOption);

    if (componentOption[0]) {
      defaultValue = componentOption[0].defaultValue;
    } else {
      const customOption = new Option();
      customOption.key = selectedOption;

      const componentType = endpoint.componentType.toLowerCase();
      const camelComponentType = this.components.getCamelComponentType(componentType);

      const optionArray: Array<string> = [];
      optionArray.splice(optionIndex, 0, customOption.key);

      this.componentOptions[index].push({
        name: selectedOption,
        displayName: selectedOption,
        description: 'Custom option',
        group: 'custom',
        type: 'string',
        componentType: camelComponentType,
      });

      this.customOptions.push({
        name: selectedOption,
        displayName: selectedOption,
        description: 'Custom option',
        group: 'custom',
        type: 'string',
        componentType: camelComponentType,
      });
    }

    const endpointData = (<FormArray>this.editFlowForm.controls.endpointsData).controls[index];
    const formOptions = <FormArray>(<FormGroup>endpointData).controls.options;

    if (defaultValue) {
      (<FormGroup>formOptions.controls[optionIndex]).controls.defaultValue.patchValue('Default Value: ' + defaultValue);
    } else {
      (<FormGroup>formOptions.controls[optionIndex]).controls.defaultValue.patchValue('');
    }
  }

  addOptionTag(name): any {
    return { name, displayName: name, description: 'Custom option', group: 'custom', type: 'string', componentType: 'file' };
  }

  addEndpoint(endpoint, index): void {
    let newIndex = index + 1;

    if (endpoint.responseId !== undefined) {
      newIndex += 1;
    }

    this.endpoints.splice(newIndex, 0, new Endpoint());
    this.endpointsOptions.splice(newIndex, 0, [new Option()]);

    if (endpoint.endpointType === 'FROM') {
      this.numberOfFromEndpoints = this.numberOfFromEndpoints + 1;
    } else if (endpoint.endpointType === 'TO') {
      this.numberOfToEndpoints = this.numberOfToEndpoints + 1;
    }

    const newEndpoint = this.endpoints.find((e, i) => i === newIndex);

    newEndpoint.endpointType = endpoint.endpointType;
    newEndpoint.componentType = this.gateways[this.indexGateway].defaultToComponentType;

    (<FormArray>this.editFlowForm.controls.endpointsData).insert(newIndex, this.initializeEndpointData(newEndpoint));

    this.setTypeLinks(endpoint, newIndex);

    const optionArray: Array<string> = [];
    optionArray.splice(0, 0, '');
    this.selectedOptions.splice(newIndex, 0, optionArray);
    this.active = newIndex.toString();
  }

  removeEndpoint(endpoint, endpointDataName): void {
    if (endpoint.endpointType === 'FROM') {
      this.numberOfFromEndpoints = this.numberOfFromEndpoints - 1;
    } else if (endpoint.endpointType === 'TO') {
      this.numberOfToEndpoints = this.numberOfToEndpoints - 1;
      if (endpoint.responseId !== undefined) {
        this.removeResponseEndpoint(endpoint);
      }
    }

    const i = this.endpoints.indexOf(endpoint);
    this.endpoints.splice(i, 1);
    this.endpointsOptions.splice(i, 1);
    this.editFlowForm.removeControl(endpointDataName); // 'endpointData'+index
    (<FormArray>this.editFlowForm.controls.endpointsData).removeAt(i);
  }

  addResponseEndpoint(endpoint): void {
    this.numberOfResponseEndpoints = this.numberOfResponseEndpoints + 1;

    const toIndex = this.endpoints.indexOf(endpoint);
    const responseIndex = toIndex + 1;

    this.endpoints.splice(responseIndex, 0, new Endpoint());
    this.endpointsOptions.splice(responseIndex, 0, [new Option()]);

    const newEndpoint = this.endpoints.find((e, i) => i === responseIndex);

    newEndpoint.endpointType = EndpointType.RESPONSE;
    newEndpoint.componentType = this.gateways[this.indexGateway].defaultToComponentType;

    (<FormArray>this.editFlowForm.controls.endpointsData).insert(responseIndex, this.initializeEndpointData(newEndpoint));

    this.setTypeLinks(newEndpoint, responseIndex);

    const newIndex = responseIndex;

    // dummy id's for endpoints
    endpoint.id = toIndex;
    newEndpoint.id = responseIndex;

    endpoint.responseId = this.numberOfResponseEndpoints;

    newEndpoint.responseId = endpoint.responseId;

    this.active = newIndex.toString();
  }

  removeResponseEndpoint(endpoint): void {
    let responseIndex: any;
    responseIndex = endpoint.responseId !== undefined ? this.endpoints.indexOf(endpoint) + 1 : undefined;
    // Find the index of the response endpoint belonging to the to endpoint

    if (responseIndex !== undefined) {
      this.numberOfResponseEndpoints = this.numberOfResponseEndpoints - 1;
      endpoint.responseId = undefined;

      this.endpoints.splice(responseIndex, 1);
      this.endpointsOptions.splice(responseIndex, 1);
      this.editFlowForm.removeControl('endpointData' + responseIndex);
      (<FormArray>this.editFlowForm.controls.endpointsData).removeAt(responseIndex);
    }
  }

  openModal(templateRef: TemplateRef<any>): void {
    this.modalRef = this.modalService.open(templateRef);
  }

  openTestConnectionModal(templateRef: TemplateRef<any>) {
    this.initializeTestConnectionForm();
    this.testConnectionMessage = '';
    this.modalRef = this.modalService.open(templateRef);
  }

  cancelModal(): void {
	  this.modalRef.dismiss();
	  this.modalRef = null;
  }

  testConnection(): void {
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

  previousState(): void {
    window.history.back();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.eventManager.destroy(this.eventSubscriber);
  }

  registerChangeInFlows(): void {
    this.eventSubscriber = this.eventManager.subscribe('flowListModification', response => {
      this.load(this.flow.id);
    });
  }

  createOrEditHeader(endpoint, formHeader: FormControl): void {
    endpoint.headerId = formHeader.value;

    if (typeof endpoint.headerId === 'undefined' || endpoint.headerId === null || !endpoint.headerId) {
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

  createOrEditRoute(endpoint, formRoute: FormControl): void {
    endpoint.routeId = formRoute.value;

    if (typeof endpoint.routeId === 'undefined' || endpoint.routeId === null || !endpoint.routeId) {
      const modalRef = this.routePopupService.open(RouteDialogComponent as Component, null, this.flow.type);
      modalRef.then(res => {
        res.result.then(
          result => {
            this.setRoute(endpoint, result.id, formRoute);
          },
          reason => {
            this.setRoute(endpoint, reason.id, formRoute);
          }
        );
      });
    } else {
      const modalRef = this.routePopupService.open(RouteDialogComponent as Component, endpoint.routeId,this.flow.type);
      modalRef.then(res => {
        // Success
        res.result.then(
          result => {
            this.setRoute(endpoint, result.id, formRoute);
          },
          reason => {
            this.setRoute(endpoint, reason.id, formRoute);
          }
        );
      });
    }
  }

  createOrEditService(endpoint, serviceType: string, formService: FormControl): void {
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
            // this.setService(endpoint, reason.id, formService);
          }
        );
      });
    }
  }

  setHeader(endpoint, id, formHeader: FormControl): void {
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

  setRoute(endpoint, id, formRoute: FormControl): void {
    this.routeService.getAllRoutes().subscribe(
      res => {
        this.routes = res.body;
        this.routeCreated = this.routes.length > 0;
        endpoint.routeId = id;

        if (formRoute.value === null) {
          formRoute.patchValue(id);
        }
        endpoint = null;
      },
      res => this.onError(res.body)
    );
  }

  setService(endpoint, id, formService: FormControl): void {
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

  handleErrorWhileCreatingFlow(flowId?: number, endpointId?: number): void {
    if (flowId !== null) {
      this.flowService.delete(flowId);
    }
    if (endpointId !== null) {
      this.endpointService.delete(endpointId);
    }
    this.savingFlowFailed = true;
    this.isSaving = false;
  }

  export(flow: IFlow): void {
    this.flowService.exportFlowConfiguration(flow);
  }

  save(): any {
    this.setDataFromForm();
    this.setOptions();
    this.setVersion();

    this.savingFlowFailed = false;
    this.savingFlowSuccess = false;
    const goToOverview = true;

    if (!this.editFlowForm.valid) {
      return;
    }

    if (this.checkUniqueEndpoints()) {
      return;
    }

    if (this.flow.id) {
      this.endpoints.forEach(endpoint => {
        endpoint.flowId = this.flow.id;
      });

      this.flowService.update(this.flow).subscribe(flow => {
        this.flow = flow.body;
        const updateEndpoints = this.endpointService.updateMultiple(this.endpoints);

        updateEndpoints.subscribe(results => {
          this.endpoints = results.body.concat();

          this.updateForm();

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
                );
              });
            }
          });
          this.savingFlowSuccess = true;
          this.isSaving = false;
          this.router.navigate(['/']);
        });
      });
    } else {
      this.flow.gatewayId = this.gateways[0].id;

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
              this.router.navigate(['/']);
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

  checkUniqueEndpoints(): boolean {
    if (this.savingCheckEndpoints) {
      this.savingCheckEndpoints = false;

      const uniqueEndpoints = [...new Map(this.endpoints.map(item => [item['uri'], item])).values()];

      if (this.endpoints.length !== uniqueEndpoints.length) {
        this.notUniqueUriMessage = `Endpoint Uri's are not unique (check for possible loops).`;
        return true;
      }
    }

    return false;
  }

  setDataFromForm(): void {
    const flowControls = this.editFlowForm.controls;

    flowControls.name.markAsTouched();
    flowControls.name.updateValueAndValidity();

    this.flow.id = flowControls.id.value;
    this.flow.name = flowControls.name.value;
    this.flow.notes = flowControls.notes.value;
    this.flow.autoStart = flowControls.autoStart.value;
    this.flow.assimblyHeaders = flowControls.assimblyHeaders.value;
    this.flow.parallelProcessing = flowControls.parallelProcessing.value;
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
    endpoint.headerId = formEndpointData.header.value;
    endpoint.routeId = formEndpointData.route.value;
    endpoint.serviceId = formEndpointData.service.value;
  }

  setVersion(): void {
    const now = dayjs();

    if (this.flow.id) {
      this.flow.version = this.flow.version + 1;
      this.flow.lastModified = now;
    } else {
      this.flow.version = 1;
      this.flow.created = now;
      this.flow.lastModified = now;
    }
  }

  // Get currrent scroll position
  findPos(obj): number {
    let curtop = 0;

    if (obj.offsetParent) {
      do {
        curtop += obj.offsetTop;
      } while ((obj = obj.offsetParent));
    }

    return curtop;
  }

  goBack(): void {
    window.history.back();
  }

  setInvalidUriMessage(endpointName: string): void {
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

  validateTypeAndUri(endpoint: FormGroup): void {
    endpoint.controls.componentType.markAsTouched();
    endpoint.controls.uri.markAsTouched();
  }

  markAsUntouchedTypeAndUri(endpoint: FormGroup): void {
    endpoint.controls.componentType.markAsUntouched();
    endpoint.controls.uri.markAsUntouched();
  }

  private subscribeToSaveResponse(result: Observable<Flow>): void {
    result.subscribe(
      (res: Flow) => this.onSaveSuccess(res),
      (res: Response) => this.onSaveError()
    );
  }

  private onSaveSuccess(result: Flow): void {
    this.eventManager.broadcast(new EventWithContent('flowListModification', 'OK'));
    this.isSaving = false;
  }

  private onSaveError(): void {
    this.isSaving = false;
  }

  private onError(error): void {
		this.alertService.addAlert({
		  type: 'danger',
		  message: error.message,
		});
  }

  private decycle(obj, stack = []) {
    if (!obj || typeof obj !== 'object') {return obj;}

    if (stack.includes(obj)) {return null;}

    const s = stack.concat([obj]);

    return Array.isArray(obj)
      ? obj.map(x => this.decycle(x, s))
      : Object.entries(Object.entries(obj).map(([k, v]) => [k, this.decycle(v, s)]));
  }
}

export class Option {
  constructor(public key?: string, public value?: string) {}
}

export class TypeLinks {
  constructor(public name: string, public assimblyTypeLink: string, public camelTypeLink: string) {}
}
