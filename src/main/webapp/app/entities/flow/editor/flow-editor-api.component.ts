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
import { Step, StepType, IStep } from 'app/shared/model/step.model';
import { Flow, IFlow, LogLevelType } from 'app/shared/model/flow.model';
import { Gateway } from 'app/shared/model/gateway.model';
import { IHeader } from 'app/shared/model/header.model';
import { Route } from 'app/shared/model/route.model';
import { Service } from 'app/shared/model/service.model';
import dayjs from 'dayjs/esm';
import { forkJoin, from, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { StepService } from '../../step/step.service';
import { GatewayService } from '../../gateway/gateway.service';
import { HeaderService } from '../../header/header.service';
import { RouteService } from '../../route/route.service';
import { ServiceService } from '../../service/service.service';
import { FlowService } from '../flow.service';


@Component({
  selector: 'jhi-flow-editor-api',
  templateUrl: './flow-editor-api.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class FlowEditorApiComponent implements OnInit, OnDestroy {
  flow: IFlow;
  headers: IHeader[];
  routes: Route[];
  services: Service[];

  stepsOptions: Array<Array<Option>> = [[]];
  URIList: Array<Array<Step>> = [[]];
  allsteps: IStep[] = new Array<Step>();
  steps: IStep[] = new Array<Step>();
  step: IStep;

  public stepTypes = ['FROM', 'TO', 'ERROR']; // Dont include RESPONSE here!

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
  activeStep: any;

  isSaving: boolean;
  savingFlowFailed = false;
  savingFlowFailedMessage = 'Saving failed (check logs)';
  savingFlowSuccess = false;
  savingFlowSuccessMessage = 'Flow successfully saved';
  savingCheckSteps = true;

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

  numberOfFromSteps = 0;
  numberOfToSteps = 0;
  numberOfResponseSteps = 0;

  loading = false;

  modalRef: NgbModalRef | null;

  private subscription: Subscription;
  private eventSubscriber: Subscription;
  private wikiDocUrl: string;
  private camelDocUrl: string;

  constructor(
    private eventManager: EventManager,
    private gatewayService: GatewayService,
    private flowService: FlowService,
    private stepService: StepService,
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

	  this.activeStep = params['stepid'];

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
      this.stepService.query(),
      this.flowService.getGatewayName(),
    ]).subscribe(([wikiDocUrl, camelDocUrl, headers, routes, services, gateways, allsteps, gatewayName]) => {
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

      this.allsteps = allsteps.body;

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

            this.stepService.findByFlowId(id).subscribe(flowStepsData => {
              const steps = flowStepsData.body;
              let index = 0;
              this.steps = [];

              this.stepTypes.forEach((stepType, j) => {
                let filteredSteps = steps.filter(step => step.stepType === stepType);

                const filteredStepsWithResponse = new Array<Step>();

                // add response steps
                filteredSteps.forEach(step => {
                  filteredStepsWithResponse.push(step);
                  if (step.responseId !== undefined) {
                    steps.filter(ep => {
                      if (ep.stepType === 'RESPONSE' && ep.responseId === step.responseId) {
                        this.numberOfResponseSteps += 1;
                        filteredStepsWithResponse.push(ep);
                      }
                    });
                  }
                });
                filteredSteps = filteredStepsWithResponse;

                filteredSteps.forEach((step) => {
                  if (typeof this.stepsOptions[index] === 'undefined') {
                    this.stepsOptions.push([]);
                  }

                  this.step = new Step(
                    step.id,
                    step.stepType,
                    step.componentType,
                    step.uri,
                    step.options,
                    step.responseId,
                    step.flowId,
                    step.serviceId,
                    step.headerId,
                    step.routeId
                  );

                  this.steps.push(step);

                  const formgroup = this.initializeStepData(step);
                  (<FormArray>this.editFlowForm.controls.stepsData).insert(index, formgroup);

                  this.setTypeLinks(step, index);

                  this.getOptions(
                    step,
                    this.editFlowForm.controls.stepsData.get(index.toString()),
                    this.stepsOptions[index],
                    index
                  );

                  if (this.step.stepType === 'FROM') {
                    this.numberOfFromSteps = this.numberOfFromSteps + 1;
                  } else if (this.step.stepType === 'TO') {
                    this.numberOfToSteps = this.numberOfToSteps + 1;
                  }

                  index = index + 1;
                }, this);

              }, this);

       		  if (this.activeStep) {
					const activeIndex = this.steps.findIndex(item => item.id.toString() === this.activeStep);
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

          // create new from step
          this.step = new Step();
          this.step.stepType = StepType.FROM;
          this.step.componentType = this.gateways[this.indexGateway].defaultFromComponentType.toLowerCase();

          (<FormArray>this.editFlowForm.controls.stepsData).push(this.initializeStepData(this.step));
          this.stepsOptions[0] = [new Option()];

          // set documentation links
          this.setTypeLinks(this.step, 0);

          let componentType = this.step.componentType.toLowerCase();
          let camelComponentType = this.components.getCamelComponentType(componentType);

          // get list of options (from CamelCatalog)
          this.setComponentOptions(this.step, camelComponentType);

          this.numberOfFromSteps = 1;

          const optionArrayFrom: Array<string> = [];
          optionArrayFrom.splice(0, 0, '');
          this.selectedOptions.splice(0, 0, optionArrayFrom);

          this.steps.push(this.step);

          // create new to step
          this.step = new Step();
          this.step.stepType = StepType.TO;
          this.step.componentType = this.gateways[this.indexGateway].defaultToComponentType.toLowerCase();
          (<FormArray>this.editFlowForm.controls.stepsData).push(this.initializeStepData(this.step));
          this.stepsOptions[1] = [new Option()];

          this.setTypeLinks(this.step, 1);
          componentType = this.step.componentType.toLowerCase();
          camelComponentType = this.components.getCamelComponentType(componentType);

          this.setComponentOptions(this.step, camelComponentType);

          this.numberOfToSteps = 1;

          const optionArrayTo: Array<string> = [];
          optionArrayTo.splice(0, 0, '');
          this.selectedOptions.splice(1, 0, optionArrayTo);

          this.steps.push(this.step);

          // create new error step
          this.step = new Step();
          this.step.stepType = StepType.ERROR;
          this.step.componentType = this.gateways[this.indexGateway].defaultErrorComponentType.toLowerCase();
          (<FormArray>this.editFlowForm.controls.stepsData).push(this.initializeStepData(this.step));
          this.stepsOptions[2] = [new Option()];
          this.setTypeLinks(this.step, 2);

          componentType = this.step.componentType.toLowerCase();
          camelComponentType = this.components.getCamelComponentType(componentType);
          this.setComponentOptions(this.step, camelComponentType);

          const optionArrayError: Array<string> = [];
          optionArrayError.splice(0, 0, '');
          this.selectedOptions.splice(2, 0, optionArrayError);

          this.steps.push(this.step);

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
    this.flow.steps = null;

    this.steps.forEach((step) => {
      step.id = null;
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
  filterServices(step: any, formService: FormControl): void {
    this.serviceType[this.steps.indexOf(step)] = this.servicesList.getServiceType(step.componentType);
    this.filterService[this.steps.indexOf(step)] = this.services.filter(
      f => f.type === this.serviceType[this.steps.indexOf(step)]
    );

    if (this.filterService[this.steps.indexOf(step)].length > 0 && step.serviceId) {
      formService.setValue(this.filterService[this.steps.indexOf(step)].find(fs => fs.id === step.serviceId).id);
    }
  }

  setTypeLinks(step: any, stepFormIndex?, e?: Event): void {
    const stepForm = <FormGroup>(<FormArray>this.editFlowForm.controls.stepsData).controls[stepFormIndex];

    if (typeof e !== 'undefined') {
      // set componenttype to selected component and clear other fields
      step.componentType = e;
      step.uri = null;
      step.headerId = '';
      step.routeId = '';
      step.serviceId = '';

      let i;
      const numberOfOptions = this.stepsOptions[stepFormIndex].length - 1;
      for (i = numberOfOptions; i > 0; i--) {
        this.stepsOptions[stepFormIndex][i] = null;
        this.removeOption(this.stepsOptions[stepFormIndex], this.stepsOptions[stepFormIndex][i], stepFormIndex);
      }

      stepForm.controls.uri.patchValue(step.uri);
      (<FormArray>stepForm.controls.options).controls[0].patchValue({
        key: null,
        value: null,
      });
      stepForm.controls.header.patchValue(step.headerId);
      stepForm.controls.service.patchValue(step.routeId);
      stepForm.controls.service.patchValue(step.serviceId);
    } else if (!step.componentType) {
      step.componentType = 'file';
    }

    this.selectedComponentType = step.componentType.toString();

    const componentType = step.componentType.toString().toLowerCase();
    const camelComponentType = this.components.getCamelComponentType(componentType);

    const type = this.components.types.find(component => component.name === componentType);
    const camelType = this.components.types.find(component => component.name === camelComponentType);

    this.filterServices(step, stepForm.controls.service as FormControl);

    this.componentTypeAssimblyLinks[stepFormIndex] = this.wikiDocUrl + '/component-' + componentType;
    this.componentTypeCamelLinks[stepFormIndex] = this.camelDocUrl + '/' + camelComponentType + '-component.html';

    this.uriPlaceholders[stepFormIndex] = type.syntax;
    this.uriPopoverMessages[stepFormIndex] = type.description;

    // set options keys
    if (typeof e !== 'undefined') {
      this.setComponentOptions(step, camelComponentType).subscribe(data => {
        // add custom options if available
        this.customOptions.forEach(customOption => {
          if (customOption.componentType === camelComponentType) {
            this.componentOptions[stepFormIndex].push(customOption);
          }
        });
      });
    }

    stepForm.patchValue({ string: componentType });

    this.enableFields(stepForm);

    this.setURIlist(stepFormIndex);
  }

  setPopoverMessages(): void {
    this.namePopoverMessage = `Name of the flow. Usually the name of the message type like <i>order</i>.<br/><br>Displayed on the <i>flows</i> page.`;
    this.notesPopoverMessage = `Notes to documentatie your flow`;
    this.autoStartPopoverMessage = `If true then the flow starts automatically when the gateway starts.`;
    this.assimblyHeadersPopoverMessage = `If true then message headers like timestamp, uri, flowid and correlationid are set. These headers start with Assimbly and can be used for logging purposes. `;
    this.parallelProcessingPopoverMessage = `If true then to steps are processed in parallel.`;
    this.maximumRedeliveriesPopoverMessage = `The maximum times a messages is redelivered in case of failure.<br/><br/>`;
    this.redeliveryDelayPopoverMessage = `The delay in miliseconds between redeliveries (this delays all messages!)`;
    this.logLevelPopoverMessage = `Sets the log level (default=OFF). This logs incoming and outgoing messages in the flow`;
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
    this.portPopoverMessage = `Number of the port. Range between 1 and 65536`;
    this.timeoutPopoverMessage = `Timeout in seconds to wait for connection.`;
  }

  setURIlist(index): void {
    this.URIList[index] = [];

    const tStepsUnique = this.allsteps.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

    tStepsUnique.forEach((step) => {
	   if(step.stepType === 'FROM' ||
		  step.stepType === 'TO'   ||
		  step.stepType === 'ERROR'   ||
		  step.stepType === 'RESPONSE'){
		  if (step.componentType && this.selectedComponentType === step.componentType.toLowerCase()) {
				this.URIList[index].push(step);
		  }
  	    }
    });

    this.URIList.sort();
  }

  enableFields(stepForm): void {
    const componentHasService = this.servicesList.getServiceType(stepForm.controls.componentType.value);

    if (stepForm.controls.componentType.value === 'wastebin') {
      stepForm.controls.uri.disable();
      stepForm.controls.options.disable();
      stepForm.controls.header.disable();
      stepForm.controls.route.disable();
      stepForm.controls.service.disable();
    } else if (componentHasService) {
      stepForm.controls.uri.enable();
      stepForm.controls.options.enable();
      stepForm.controls.header.enable();
      stepForm.controls.route.enable();
      stepForm.controls.service.enable();
    } else {
      stepForm.controls.uri.enable();
      stepForm.controls.options.enable();
      stepForm.controls.header.enable();
      stepForm.controls.route.enable();
      stepForm.controls.service.disable();
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
      stepsData: new FormArray([]),
    });
  }

  initializeStepData(step: Step): FormGroup {
    return new FormGroup({
      id: new FormControl(step.id),
      componentType: new FormControl(step.componentType, Validators.required),
      uri: new FormControl(step.uri),
      options: new FormArray([this.initializeOption()]),
      header: new FormControl(step.headerId),
      route: new FormControl(step.routeId),
      service: new FormControl(step.serviceId, Validators.required),
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

    const stepsData = this.editFlowForm.controls.stepsData as FormArray;
    this.steps.forEach((step, i) => {
      this.updateStepData(step, stepsData.controls[i] as FormControl);
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

  updateStepData(step: any, stepData: FormControl): void {
    stepData.patchValue({
      id: step.id,
      stepType: step.stepType,
      componentType: step.componentType,
      uri: step.uri,
      header: step.headerId,
      route: step.routeId,
      service: step.serviceId,
      responseId: step.responseId,
    });
  }

  setComponentOptions(step: Step, componentType: string): Observable<any> {
    return from(
      new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          this.getComponentOptions(componentType).subscribe(data => {
            const componentOptions = data.properties;

            this.componentOptions[this.steps.indexOf(step)] = Object.keys(componentOptions).map(key => ({
              ...componentOptions[key],
              ...{ name: key },
            }));
            this.componentOptions[this.steps.indexOf(step)].sort(function (a, b) {
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

  getOptions(step: Step, stepForm: any, stepOptions: Array<Option>, index: number): void {
    const optionArray: Array<string> = [];

    if (!step.options) {
      step.options = '';
    }

    const componentType = step.componentType.toLowerCase();
    const camelComponentType = this.components.getCamelComponentType(componentType);

    this.setComponentOptions(step, camelComponentType).subscribe(data => {

	  let options: Array<string> = [];

	  if(step.options.includes('&')){
		options = step.options.match(/[^&]+(?:&&[^&]+)*/g);
	  }else{
		options = step.options.split('&');
	  }

      options.forEach((option, optionIndex) => {
        const o = new Option();

        if (typeof stepForm.controls.options.controls[optionIndex] === 'undefined') {
          stepForm.controls.options.push(this.initializeOption());
        }

        if (option.includes('=')) {
          o.key = option.split('=')[0];
          o.value = option.split('=').slice(1).join('=');
        } else {
          o.key = null;
          o.value = null;
        }

        optionArray.splice(optionIndex, 0, o.key);

        stepForm.controls.options.controls[optionIndex].patchValue({
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

        stepOptions.push(o);
      });
    });

    this.selectedOptions.splice(index, 0, optionArray);
  }

  setOptions(): void {
    this.steps.forEach((step, i) => {
      step.options = '';
      this.setStepOptions(this.stepsOptions[i], step, this.selectOptions(i));
    });
  }

  setStepOptions(stepOptions: Array<Option>, step, formOptions: FormArray): void {
    let index = 0;

    stepOptions.forEach((option, i) => {
      option.key = (<FormGroup>formOptions.controls[i]).controls.key.value;
      option.value = (<FormGroup>formOptions.controls[i]).controls.value.value;

      if (option.key && option.value) {
        step.options += index > 0 ? `&${option.key}=${option.value}` : `${option.key}=${option.value}`;
        index++;
      }
    });
  }

  addOption(options: Array<Option>, stepIndex): void {
    this.selectOptions(stepIndex).push(this.initializeOption());

    options.push(new Option());
  }

  removeOption(options: Array<Option>, option: Option, stepIndex): void {
    const optionIndex = options.indexOf(option);
    const formOptions: FormArray = this.selectOptions(stepIndex);

    // remove from form
    formOptions.removeAt(optionIndex);
    formOptions.updateValueAndValidity();

    // remove from arrays
    options.splice(optionIndex, 1);
    this.selectedOptions[stepIndex].splice(optionIndex, 1);
  }

  selectOptions(stepIndex): FormArray {
    const stepData = (<FormArray>this.editFlowForm.controls.stepsData).controls[stepIndex];
    return <FormArray>(<FormGroup>stepData).controls.options;
  }

  changeOptionSelection(selectedOption, index, optionIndex, step): void {
    let defaultValue;
    const componentOption = this.componentOptions[index].filter(option => option.name === selectedOption);

    if (componentOption[0]) {
      defaultValue = componentOption[0].defaultValue;
    } else {
      const customOption = new Option();
      customOption.key = selectedOption;

      const componentType = step.componentType.toLowerCase();
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

    const stepData = (<FormArray>this.editFlowForm.controls.stepsData).controls[index];
    const formOptions = <FormArray>(<FormGroup>stepData).controls.options;

    if (defaultValue) {
      (<FormGroup>formOptions.controls[optionIndex]).controls.defaultValue.patchValue('Default Value: ' + defaultValue);
    } else {
      (<FormGroup>formOptions.controls[optionIndex]).controls.defaultValue.patchValue('');
    }
  }

  addOptionTag(name): any {
    return { name, displayName: name, description: 'Custom option', group: 'custom', type: 'string', componentType: 'file' };
  }

  addStep(step, index): void {
    let newIndex = index + 1;

    if (step.responseId !== undefined) {
      newIndex += 1;
    }

    this.steps.splice(newIndex, 0, new Step());
    this.stepsOptions.splice(newIndex, 0, [new Option()]);

    if (step.stepType === 'FROM') {
      this.numberOfFromSteps = this.numberOfFromSteps + 1;
    } else if (step.stepType === 'TO') {
      this.numberOfToSteps = this.numberOfToSteps + 1;
    }

    const newStep = this.steps.find((e, i) => i === newIndex);

    newStep.stepType = step.stepType;
    newStep.componentType = this.gateways[this.indexGateway].defaultToComponentType;

    (<FormArray>this.editFlowForm.controls.stepsData).insert(newIndex, this.initializeStepData(newStep));

    this.setTypeLinks(step, newIndex);

    const optionArray: Array<string> = [];
    optionArray.splice(0, 0, '');
    this.selectedOptions.splice(newIndex, 0, optionArray);
    this.active = newIndex.toString();
  }

  removeStep(step, stepDataName): void {
    if (step.stepType === 'FROM') {
      this.numberOfFromSteps = this.numberOfFromSteps - 1;
    } else if (step.stepType === 'TO') {
      this.numberOfToSteps = this.numberOfToSteps - 1;
      if (step.responseId !== undefined) {
        this.removeResponseStep(step);
      }
    }

    const i = this.steps.indexOf(step);
    this.steps.splice(i, 1);
    this.stepsOptions.splice(i, 1);
    this.editFlowForm.removeControl(stepDataName); // 'stepData'+index
    (<FormArray>this.editFlowForm.controls.stepsData).removeAt(i);
  }

  addResponseStep(step): void {
    this.numberOfResponseSteps = this.numberOfResponseSteps + 1;

    const toIndex = this.steps.indexOf(step);
    const responseIndex = toIndex + 1;

    this.steps.splice(responseIndex, 0, new Step());
    this.stepsOptions.splice(responseIndex, 0, [new Option()]);

    const newStep = this.steps.find((e, i) => i === responseIndex);

    newStep.stepType = StepType.RESPONSE;
    newStep.componentType = this.gateways[this.indexGateway].defaultToComponentType;

    (<FormArray>this.editFlowForm.controls.stepsData).insert(responseIndex, this.initializeStepData(newStep));

    this.setTypeLinks(newStep, responseIndex);

    const newIndex = responseIndex;

    // dummy id's for steps
    step.id = toIndex;
    newStep.id = responseIndex;

    step.responseId = this.numberOfResponseSteps;

    newStep.responseId = step.responseId;

    this.active = newIndex.toString();
  }

  removeResponseStep(step): void {
    let responseIndex: any;
    responseIndex = step.responseId !== undefined ? this.steps.indexOf(step) + 1 : undefined;
    // Find the index of the response step belonging to the to step

    if (responseIndex !== undefined) {
      this.numberOfResponseSteps = this.numberOfResponseSteps - 1;
      step.responseId = undefined;

      this.steps.splice(responseIndex, 1);
      this.stepsOptions.splice(responseIndex, 1);
      this.editFlowForm.removeControl('stepData' + responseIndex);
      (<FormArray>this.editFlowForm.controls.stepsData).removeAt(responseIndex);
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

  createOrEditHeader(step, formHeader: FormControl): void {
    step.headerId = formHeader.value;

    if (typeof step.headerId === 'undefined' || step.headerId === null || !step.headerId) {
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

  createOrEditRoute(step, formRoute: FormControl): void {
    step.routeId = formRoute.value;

    if (typeof step.routeId === 'undefined' || step.routeId === null || !step.routeId) {
      const modalRef = this.routePopupService.open(RouteDialogComponent as Component);
      modalRef.then(res => {
        res.result.then(
          result => {
            this.setRoute(step, result.id, formRoute);
          },
          reason => {
            this.setRoute(step, reason.id, formRoute);
          }
        );
      });
    } else {
      const modalRef = this.routePopupService.open(RouteDialogComponent as Component, step.routeId);
      modalRef.then(res => {
        // Success
        res.result.then(
          result => {
            this.setRoute(step, result.id, formRoute);
          },
          reason => {
            this.setRoute(step, reason.id, formRoute);
          }
        );
      });
    }
  }

  createOrEditService(step, serviceType: string, formService: FormControl): void {
    step.serviceId = formService.value;

    if (typeof step.serviceId === 'undefined' || step.serviceId === null || !step.serviceId) {
      const modalRef = this.servicePopupService.open(ServiceDialogComponent as Component);
      modalRef.then(res => {
        // Success
        res.componentInstance.serviceType = serviceType;
        res.result.then(
          result => {
            this.setService(step, result.id, formService);
          },
          reason => {
            this.setService(step, reason.id, formService);
          }
        );
      });
    } else {
      const modalRef = this.servicePopupService.open(ServiceDialogComponent as Component, step.serviceId);
      modalRef.then(res => {
        res.componentInstance.serviceType = serviceType;
        res.result.then(
          result => {
            this.setService(step, result.id, formService);
          },
          reason => {
            // this.setService(step, reason.id, formService);
          }
        );
      });
    }
  }

  setHeader(step, id, formHeader: FormControl): void {
    this.headerService.getAllHeaders().subscribe(
      res => {
        this.headers = res.body;
        this.headerCreated = this.headers.length > 0;
        step.headerId = id;

        if (formHeader.value === null) {
          formHeader.patchValue(id);
        }
        step = null;
      },
      res => this.onError(res.body)
    );
  }

  setRoute(step, id, formRoute: FormControl): void {
    this.routeService.getAllRoutes().subscribe(
      res => {
        this.routes = res.body;
        this.routeCreated = this.routes.length > 0;
        step.routeId = id;

        if (formRoute.value === null) {
          formRoute.patchValue(id);
        }
        step = null;
      },
      res => this.onError(res.body)
    );
  }

  setService(step, id, formService: FormControl): void {
    this.serviceService.getAllServices().subscribe(
      res => {
        this.services = res.body;
        this.serviceCreated = this.services.length > 0;
        step.serviceId = id;
        formService.patchValue(id);
        this.filterServices(step, formService);
      },
      res => this.onError(res.body)
    );
  }

  handleErrorWhileCreatingFlow(flowId?: number, stepId?: number): void {
    if (flowId !== null) {
      this.flowService.delete(flowId);
    }
    if (stepId !== null) {
      this.stepService.delete(stepId);
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

    if (this.checkUniqueSteps()) {
      return;
    }

    if (this.flow.id) {
      this.steps.forEach(step => {
        step.flowId = this.flow.id;
      });

      this.flowService.update(this.flow).subscribe(flow => {
        this.flow = flow.body;
        const updateSteps = this.stepService.updateMultiple(this.steps);

        updateSteps.subscribe(results => {
          this.steps = results.body.concat();

          this.updateForm();

          this.stepService.findByFlowId(this.flow.id).subscribe(data => {
            let steps = data.body;
            steps = steps.filter(e => {
              const s = this.steps.find(t => t.id === e.id);
              if (typeof s === 'undefined') {
                return true;
              } else {
                return s.id !== e.id;
              }
            });

            if (steps.length > 0) {
              steps.forEach(element => {
                this.stepService.delete(element.id).subscribe(
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

          this.steps.forEach(step => {
            step.flowId = this.flow.id;
          });

          this.stepService.createMultiple(this.steps).subscribe(
            toRes => {
              this.steps = toRes.body;
              this.updateForm();
              this.finished = true;
              this.savingFlowSuccess = true;
              this.isSaving = false;
              this.router.navigate(['/']);
            },
            () => {
              this.handleErrorWhileCreatingFlow(this.flow.id, this.step.id);
            }
          );
        },
        () => {
          this.handleErrorWhileCreatingFlow(this.flow.id, this.step.id);
        }
      );
    }
  }

  checkUniqueSteps(): boolean {
    if (this.savingCheckSteps) {
      this.savingCheckSteps = false;

      const uniqueSteps = [...new Map(this.steps.map(item => [item['uri'], item])).values()];

      if (this.steps.length !== uniqueSteps.length) {
        this.notUniqueUriMessage = `Step Uri's are not unique (check for possible loops).`;
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

    (<FormArray>flowControls.stepsData).controls.forEach((step, index) => {
      this.setDataFromFormOnStep(this.steps[index], (<FormGroup>step).controls);
    });
  }

  setDataFromFormOnStep(step, formStepData) {
    formStepData.uri.setValidators([Validators.required]);
    formStepData.uri.updateValueAndValidity();

    step.id = formStepData.id.value;
    step.componentType = formStepData.componentType.value;
    step.uri = formStepData.uri.value;
    step.headerId = formStepData.header.value;
    step.routeId = formStepData.route.value;
    step.serviceId = formStepData.service.value;
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

  setInvalidUriMessage(stepName: string): void {
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

  validateTypeAndUri(step: FormGroup): void {
    step.controls.componentType.markAsTouched();
    step.controls.uri.markAsTouched();
  }

  markAsUntouchedTypeAndUri(step: FormGroup): void {
    step.controls.componentType.markAsUntouched();
    step.controls.uri.markAsUntouched();
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
