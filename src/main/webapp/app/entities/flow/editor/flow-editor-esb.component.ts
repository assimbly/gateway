import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "app/core/util/alert.service";
import { EventManager, EventWithContent } from "app/core/util/event-manager.service";
import { RouteDialogComponent } from "app/entities/route/route-dialog.component";
import { RoutePopupService } from "app/entities/route/route-popup.service";
import { ConnectionDialogComponent } from 'app/entities/connection/connection-dialog.component';
import { ConnectionPopupService } from 'app/entities/connection/connection-popup.service';
import { Components } from "app/shared/camel/component-type";
import { Connections } from "app/shared/camel/connections";
import { Step, StepType, IStep } from "app/shared/model/step.model";
import { Flow, IFlow, LogLevelType } from "app/shared/model/flow.model";
import { Gateway } from "app/shared/model/gateway.model";
import { Route } from "app/shared/model/route.model";
import { Connection } from 'app/shared/model/connection.model';
import dayjs from "dayjs/esm";
import { from, forkJoin, Observable, Subscription } from "rxjs";
import { map } from 'rxjs/operators';
import { StepService } from "../../step/step.service";
import { GatewayService } from "../../gateway/gateway.service";
import { RouteService } from "../../route/route.service";
import { ConnectionService } from '../../connection/connection.service';
import { FlowService } from "../flow.service";

@Component({
  selector: 'jhi-flow-editor-esb',
  templateUrl: './flow-editor-esb.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class FlowEditorEsbComponent implements OnInit, OnDestroy {
	flow: IFlow;
	routes: Route[];
  connections: Connection[];


	URIList: Array<Array<Step>> = [[]];
	allsteps: IStep[] = new Array<Step>();
  stepsOptions: Array<Array<Option>> = [[]];
	steps: IStep[] = new Array<Step>();
	step: IStep;

  //Future possibilities
	//public stepTypes = ["SOURCE", "ACTION", "SINK", "ROUTER", "ROUTE", "SCRIPT", "API", MESSAGE", "CONNECTION", "ERROR"];

	public stepTypes = ["SOURCE", "ACTION", "SINK", "ROUTE", "SCRIPT","CONNECTION", "ERROR"];

	public logLevelListType = [
		LogLevelType.OFF,
		LogLevelType.ON,
	];

	panelCollapsed: any = "uno";
	public isCollapsed = true;
	active: string;
	active2: any;
	disabled = true;
	activeStep: any;

	isSaving: boolean;
	savingFlowFailed = false;
	savingFlowFailedMessage = "Saving failed (check logs)";
	savingFlowSuccess = false;
	savingFlowSuccessMessage = "Flow successfully saved";
	savingCheckSteps = true;

	finished = false;

	gateways: Gateway[];
	configuredGateway: Gateway;
	gatewayName: string;
	singleGateway = false;
	indexGateway: number;

	createRoute: number;
	predicate: any;
	reverse: any;

	routeCreated: boolean;
  connectionCreated: boolean;

	namePopoverMessage: string;
	logLevelPopoverMessage: string;
	errorHandlerPopoverMessage: string;
	notesPopoverMessage: string;

  componentPopoverMessage: string;
  optionsPopoverMessage: string;
  headerPopoverMessage: string;
  routePopoverMessage: string;
  connectionPopoverMessage: string;
  popoverMessage: string;

  selectedComponentType: string;
  selectedOptions: Array<Array<any>> = [[]];
  componentOptions: Array<any> = [];
  customOptions: Array<any> = [];

  componentTypeAssimblyLinks: Array<string> = new Array<string>();
  componentTypeCamelLinks: Array<string> = new Array<string>();
  uriPlaceholders: Array<string> = new Array<string>();
  uriPopoverMessages: Array<string> = new Array<string>();

	sourceComponentsNames: Array<any> = [];
  actionComponentsNames: Array<any> = [];
	sinkComponentsNames: Array<any> = [];

  languageComponentsNames: Array<any> = ['groovy','java','javascript','jslt','python','simple','xslt'];

	editFlowForm: FormGroup;
	invalidUriMessage: string;
	notUniqueUriMessage: string;

  filterConnection: Array<Array<Connection>> = [[]];
  connectionType: Array<string> = [];
  selectedConnection: Connection = new Connection();

	numberOfSteps = 0;

	modalRef: NgbModalRef | null;

  testConnectionForm: FormGroup;
  testConnectionMessage: string;
  connectionHost: any;
  connectionPort: any;
  connectionTimeout: any;
  hostnamePopoverMessage: string;
  portPopoverMessage: string;
  timeoutPopoverMessage: string;

	private subscription: Subscription;
	private eventSubscriber: Subscription;
	private wikiDocUrl: string;
	private camelDocUrl: string;

	constructor(
		private eventManager: EventManager,
		private gatewayService: GatewayService,
		private flowService: FlowService,
		private stepService: StepService,
		private routeService: RouteService,
    private connectionService: ConnectionService,
		private alertService: AlertService,
		private route: ActivatedRoute,
		private router: Router,
		public connectionsList: Connections,
		public components: Components,
		private modalService: NgbModal,
		private routePopupService: RoutePopupService,
    private connectionPopupService: ConnectionPopupService,
	) {}

	ngOnInit(): void {
		this.isSaving = false;
		this.createRoute = 0;

		this.setPopoverMessages();

		this.setComponents();

		this.subscription =
			this.route.params.subscribe(
				(params) => {
					this.activeStep = params["stepid"];

					if (params["mode"] === "clone") {
						this.load(params["id"], true);
					} else {
						this.load(params["id"], false);
					}
				},
			);

		this.registerChangeInFlows();
	}

	load(id, isCloning?: boolean): void {
		forkJoin([
			this.flowService.getWikiDocUrl(),
			this.flowService.getCamelDocUrl(),
			this.routeService.getAllRoutes(),
      this.connectionService.getAllConnections(),
			this.gatewayService.query(),
			this.stepService.query(),
			this.flowService.getGatewayName(),
		])
			.subscribe(
				([wikiDocUrl, camelDocUrl, routes, connections, gateways, allsteps, gatewayName]) => {
					this.wikiDocUrl = wikiDocUrl.body;
					this.camelDocUrl = camelDocUrl.body;

					this.routes = routes.body;
					this.routeCreated = this.routes.length > 0;

          this.connections = connections.body;
          this.connectionCreated = this.connections.length > 0;

					this.gateways = gateways.body;
					this.singleGateway = this.gateways.length === 1;
					this.gatewayName = gatewayName.body;

					this.allsteps = allsteps.body;

					if (this.singleGateway) {
						this.indexGateway = 0;
					} else {
						this.indexGateway =
							this.gateways.findIndex(
								(gateway) => gateway.name === this.gatewayName,
							);
					}

					if (id) {
						this.flowService
							.find(id)
							.subscribe(
								(flow) => {
									this.flow = flow.body;
									if (this.singleGateway) {
										this.flow.gatewayId = this.gateways[this.indexGateway].id;
									}

									this.initializeForm(this.flow);

									this.stepService
										.findByFlowId(id)
										.subscribe(
											(flowStepsData) => {
												const steps = flowStepsData.body;
												let index = 0;
												this.steps = [];

												this.stepTypes.forEach(
													(stepType, j) => {
														let filteredSteps = steps.filter(
															(step) =>
																step.stepType === stepType,
														);

														filteredSteps.forEach(
															(step) => {

                                if (typeof this.stepsOptions[index] === 'undefined') {
                                  this.stepsOptions.push([]);
                                }

																this.step =
																	new Step(
																		step.id,
																		step.stepType,
																		step.uri,
																		step.options,
																		step.flowId,
																		step.routeId,
																		step.headerId,
								                    step.connectionId,
																	);

																this.steps.push(step);

																const formgroup = this.initializeStepData(
																	step,
																);
																this.stepsOptions[0] = [new Option()];
																(
																	<FormArray>this.editFlowForm.controls.stepsData
																).insert(index, formgroup);

                                this.setTypeLinks(step, index);

                                this.getOptions(
                                  step,
                                  this.editFlowForm.controls.stepsData.get(index.toString()),
                                  this.stepsOptions[index],
                                  index
                                );

																index = index + 1;
															},
															this,
														);
													},
													this,
												);

												if (this.activeStep) {
													const activeIndex = this.steps.findIndex(
														(item) => item.id.toString() === this.activeStep,
													);
													if (activeIndex === -1) {
														this.active = "0";
													} else {
														this.active = activeIndex.toString();
													}
												} else {
													this.active = "0";
												}

												if (isCloning) {
													this.clone();
												}

												this.finished = true;
											},
										);
								},
							);
					} else if (!this.finished) {
						setTimeout(
							() => {
								// create new flow object
								this.flow = new Flow();
								this.flow.type = 'esb';
								this.flow.notes = '';
								this.flow.autoStart = false;
								this.flow.parallelProcessing = false;
								this.flow.assimblyHeaders = false;
								this.flow.maximumRedeliveries = 0;
								this.flow.redeliveryDelay = 3000;
								this.flow.logLevel = LogLevelType.OFF;
								if (this.singleGateway) {
									this.indexGateway = 0;
									this.flow.gatewayId = this.gateways[this.indexGateway].id;
								} else {
									this.configuredGateway =
										this.gateways.find(
											(gateway) => gateway.name === this.gatewayName,
										);
									this.indexGateway =
										this.gateways.findIndex(
											(gateway) => gateway.name === this.gatewayName,
										);
									this.flow.gatewayId = this.configuredGateway.id;
								}

								this.initializeForm(this.flow);

								this.numberOfSteps = 1;

								// create new route step
								this.step = new Step();
								this.step.id = null;
								this.step.stepType = StepType.SOURCE;
  							this.step.componentType = 'file';
 								this.step.uri = null;
  							this.step.routeId = null;
	  						this.step.connectionId = null;

                (<FormArray>this.editFlowForm.controls.stepsData).push(this.initializeStepData(this.step));

                this.stepsOptions[0] = [new Option()];

                  // set documentation links
                  this.setTypeLinks(this.step, 0);

                  let componentType = this.step.componentType.toLowerCase();
                  let camelComponentType = this.components.getCamelComponentType(componentType);

                  // get list of options (from CamelCatalog)
                  this.setComponentOptions(this.step, camelComponentType);

  								this.numberOfSteps = 1;

                  const optionArrayFrom: Array<string> = [];
                  optionArrayFrom.splice(0, 0, '');
                  this.selectedOptions.splice(0, 0, optionArrayFrom);


								this.steps.push(this.step);

								this.finished = true;
							},
							0,
						);
					}

					this.active = "0";
				},
			);
	}

  setTypeLinks(step: any, stepFormIndex?, e?: Event): void {

    const stepForm = <FormGroup>(<FormArray>this.editFlowForm.controls.stepsData).controls[stepFormIndex];

    if (typeof e !== 'undefined') {

      // set componenttype to selected component and clear other fields
      step.componentType = e;
      step.stepType = 'SOURCE'
      step.uri = null;
      step.headerId = '';
      step.routeId = '';
      step.connectionId = '';

      let i;
      const numberOfOptions = this.stepsOptions[stepFormIndex].length - 1;
      for (i = numberOfOptions; i > 0; i--) {
        this.stepsOptions[stepFormIndex][i] = null;
        this.removeOption(this.stepsOptions[stepFormIndex], this.stepsOptions[stepFormIndex][i], stepFormIndex);
      }

      stepForm.controls.uri.patchValue(step.uri);
      stepForm.controls.header.patchValue(step.headerId);
      stepForm.controls.route.patchValue(step.routeId);
      stepForm.controls.connection.patchValue(step.connectionId);

      (<FormArray>stepForm.controls.options).controls[0].patchValue({
        key: null,
        value: null,
      });

    }

    this.selectedComponentType = step.componentType.toString();

    const componentType = step.componentType.toString().toLowerCase();
    const camelComponentType = this.components.getCamelComponentType(componentType);

    if(step.stepType === 'SOURCE' || step.stepType === 'ACTION' || step.stepType === 'SINK' || step.stepType === 'ROUTER'){

        const type = this.components.types.find(component => component.name === componentType);
        const camelType = this.components.types.find(component => component.name === camelComponentType);

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

    }


    stepForm.patchValue({ string: componentType });

    this.setURIlist(stepFormIndex);

  }


	setComponents(): void {
		const sourceComponents = this.components.types.filter(function (component) {
			return component.producerOnly === false;
		});

		this.sourceComponentsNames = sourceComponents.map((component) => component.name);
		this.sourceComponentsNames.sort();

		const sinkComponents = this.components.types.filter(function (component) {
			return component.consumerOnly === false;
		});

		this.sinkComponentsNames = sinkComponents.map((component) => component.name);
		this.sinkComponentsNames.sort();

		const actionComponents = this.components.types.filter(function (component) {
			return component.kind === 'action';
		});

		this.actionComponentsNames = actionComponents.map((component) => component.name);
		this.actionComponentsNames = [ ...this.actionComponentsNames, ...this.sinkComponentsNames];
		this.actionComponentsNames.sort();

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

		const scrollToTop = window.setInterval(
			() => {
				const pos = window.pageYOffset;
				if (pos > 0) {
					window.scrollTo(0, pos - 20); // how far to scroll on each step
				} else {
					window.clearInterval(scrollToTop);
				}
			},
			16,
		);
	}

  setStepComponent(step: any, stepFormIndex: number, stepType: any): void {

    const stepForm = <FormGroup>(<FormArray>this.editFlowForm.controls.stepsData).controls[stepFormIndex];

    if(stepType === 'SCRIPT'){
        step.componentType = 'groovy';
        stepForm.controls.componentType.patchValue(step.componentType);
    }else if(stepType === 'ACTION'){
             step.componentType = 'print';
             stepForm.controls.componentType.patchValue(step.componentType);
    }else{
        step.componentType = 'file';
        stepForm.controls.componentType.patchValue(step.componentType);
    }


  }

	setPopoverMessages(): void {
		this.namePopoverMessage =
			`Name of the flow. Usually the name of the message type like <i>order</i>.<br/><br>Displayed on the <i>flows</i> page.`;
		this.errorHandlerPopoverMessage =
			`Route or RouteConfiguration that handles errors in case of failures.`;
		this.logLevelPopoverMessage = `Logs messages for each step to the console/log file`;
		this.notesPopoverMessage = `Notes to document the flow.`;

    this.componentPopoverMessage = `The Apache Camel scheme to use. Click on the Apache Camel or Assimbly button for online documentation on the selected scheme.`;
    this.optionsPopoverMessage = `Options for the selected component. You can add one or more key/value pairs.<br/><br/>
                                     Click on the Apache Camel button to view documation on the valid options.`;
    this.optionsPopoverMessage = ``;
    this.headerPopoverMessage = `A group of key/value pairs to add to the message header.<br/><br/> Use the button on the right to create or edit a header.`;
    this.routePopoverMessage = `A Camel route defined in XML.<br/><br/>`;
    this.connectionPopoverMessage = `If available then a connection can be selected. For example a database connection that sets up a connection.<br/><br/>
                                     Use the button on the right to create or edit connections.`;
    this.popoverMessage = `Destination`;

    this.hostnamePopoverMessage = `URL, IP-address or DNS Name. For example camel.apache.org or 127.0.0.1`;
    this.portPopoverMessage = `Number of the port. Range between 1 and 65536.`;
    this.timeoutPopoverMessage = `Timeout in seconds to wait for connection.`;

	}

	  setURIlist(index): void {

      this.URIList[index] = [];
      let updatedList = [];

      const tStepsUnique = this.allsteps.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

      tStepsUnique.forEach((step) => {
  	   if(step.stepType === 'SOURCE' ||
  		  step.stepType === 'ACTION'   ||
  		  step.stepType === 'ROUTER'   ||
  		  step.stepType === 'SINK'){
          if (step.componentType && this.selectedComponentType === step.componentType.toLowerCase()) {
            updatedList.push(step);
          }
    	  }
      });

      this.URIList[index].push(...updatedList);

      this.URIList[index].sort();
    }

	initializeForm(flow: Flow): void {
		this.editFlowForm =
			new FormGroup({
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
      componentType: new FormControl(step.componentType),
			stepType: new FormControl(step.stepType),
      uri: new FormControl(step.uri),
      options: new FormArray([this.initializeOption()]),
      header: new FormControl(step.headerId),
			route: new FormControl(step.routeId),
			connection: new FormControl(step.connectionId),
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

		this.steps.forEach(
			(step, i) => {
				this.updateStepData(
					step,
					stepsData.controls[i] as FormControl,
				);
			},
		);
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
			componentType: step.componentType,
			stepType: step.stepType,
			uri: step.uri,
			header: step.headerId,
			route: step.routeId,
			connection: step.connectionId,
		});
	}

	addStep(step, index): void {

		let newIndex = index + 1;

		this.steps.splice(newIndex, 0, new Step());
    this.stepsOptions.splice(newIndex, 0, [new Option()]);

		this.numberOfSteps = this.numberOfSteps + 1;

		const newStep = this.steps.find((e, i) => i === newIndex);

		newStep.stepType = step.stepType;
		if(step.stepType === 'SOURCE' || step.stepType === 'SINK'){
  		newStep.componentType =	this.gateways[this.indexGateway].defaultToComponentType;
		}else if(step.stepType === 'ACTION'){
		  newStep.componentType = 'print';
		}

		(<FormArray>this.editFlowForm.controls.stepsData).insert(
			newIndex,
			this.initializeStepData(newStep),
		);

    this.setTypeLinks(step, newIndex);

    const optionArray: Array<string> = [];
    optionArray.splice(0, 0, '');
    this.selectedOptions.splice(newIndex, 0, optionArray);

		this.active = newIndex.toString();
	}

	removeStep(step, index): void {

		if (index === 0) {
  			return;
 		}

		this.numberOfSteps = this.numberOfSteps - 1;

		const i = this.steps.indexOf(step);
		this.steps.splice(i, 1);
		this.stepsOptions.splice(i, 1);
		this.editFlowForm.removeControl(index);
		(<FormArray>this.editFlowForm.controls.stepsData).removeAt(i);
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

    // set options keys

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

  // this filters connections not of the correct type
  filterConnections(step: any, formService: FormControl): void {

    //this.connectionType[this.steps.indexOf(step)] = this.connectionsList.getConnectionType(step.componentType);
    this.filterConnection[this.steps.indexOf(step)] = this.connections;

  }

	createOrEditRoute(step, formRoute: FormControl): void {
		step.routeId = formRoute.value;

		if (
			typeof step.routeId === "undefined" ||
			step.routeId === null ||
			!step.routeId
		) {
			const modalRef = this.routePopupService.open(
				RouteDialogComponent as Component,
				null,
				this.flow.type
			);
			modalRef.then(
				(res) => {
					res.result.then(
						(result) => {
							this.setRoute(step, result.id, formRoute);
						},
						(reason) => {
							this.setRoute(step, reason.id, formRoute);
						},
					);
				},
			);
		} else {
			const modalRef = this.routePopupService.open(
				RouteDialogComponent as Component,
				step.routeId,
				this.flow.type
			);
			modalRef.then(
				(res) => {
					// Success
					res.result.then(
						(result) => {
							this.setRoute(step, result.id, formRoute);
						},
						(reason) => {
							this.setRoute(step, reason.id, formRoute);
						},
					);
				},
			);
		}
	}

	setRoute(step, id, formRoute: FormControl): void {
		this.routeService
			.getAllRoutes()
			.subscribe(
				(res) => {
					this.routes = res.body;
					this.routeCreated = this.routes.length > 0;
					step.routeId = id;

					if (formRoute.value === null) {
						formRoute.patchValue(id);
					}
					step = null;
				},
				(res) => this.onError(res.body),
			);
	}

  createOrEditConnection(step, connectionType: string, formService: FormControl): void {

    step.connectionId = formService.value;

    let modalRef;

    if (typeof step.connectionId === 'undefined' || step.connectionId === null || !step.connectionId) {
        modalRef = this.connectionPopupService.open(ConnectionDialogComponent as Component);
    } else {
        modalRef = this.connectionPopupService.open(ConnectionDialogComponent as Component, step.connectionId);
    }

    modalRef.then((res) => {
       res.result.then(
              result => {
                this.setConnection(step, result.id, formService);
              },
              reason => {

              }
          );

       }, (reason)=>{

       }
    )

  }

  setConnection(step, id, formService: FormControl): void {
    this.connectionService.getAllConnections().subscribe(
      res => {
        this.connections = res.body;
        this.connectionCreated = this.connections.length > 0;
        step.connectionId = id;
        formService.patchValue(id);
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

	save(): any {

		this.savingFlowFailed = false;
		this.savingFlowSuccess = false;
		const goToOverview = true;

		this.setDataFromForm();
		this.setOptions();
		this.setVersion();
    this.checkForm();

		if (!this.editFlowForm.valid || this.savingFlowFailed) {
			return;
		}

		if (this.flow.id) {
		  this.updateFlow();
		} else {
		  this.createFlow();
		}

	}

  updateFlow(){

   this.steps.forEach(
      (step) => {
        step.flowId = this.flow.id;
      },
    );

    this.flowService
      .update(this.flow)
      .subscribe(
        (flow) => {
          this.flow = flow.body;
          const updateSteps = this.stepService.updateMultiple(
            this.steps,
          );

          updateSteps.subscribe(
            (results) => {
              this.steps = results.body.concat();

              this.updateForm();

              this.stepService
                .findByFlowId(this.flow.id)
                .subscribe(
                  (data) => {
                    let steps = data.body;
                    steps =
                      steps.filter(
                        (e) => {
                          const s = this.steps.find((t) => t.id === e.id);
                          if (typeof s === "undefined") {
                            return true;
                          } else {
                            return s.id !== e.id;
                          }
                        },
                      );

                    if (steps.length > 0) {
                      steps.forEach(
                        (element) => {
                          this.stepService.delete(element.id).subscribe();
                        },
                      );
                    }
                  },
                );
              this.savingFlowSuccess = true;
              this.isSaving = false;
              this.router.navigate(["/"]);
            },
          );
        },
      );

  }

  createFlow(){

		this.flow.gatewayId = this.gateways[0].id;

			this.flowService
				.create(this.flow)
				.subscribe(
					(flowUpdated) => {
						this.flow = flowUpdated.body;

						this.steps.forEach(
							(step) => {
								step.flowId = this.flow.id;
							},
						);

						this.stepService
							.createMultiple(this.steps)
							.subscribe(
								(toRes) => {
									this.steps = toRes.body;
									this.updateForm();
									this.finished = true;
									this.savingFlowSuccess = true;
									this.isSaving = false;
									this.router.navigate(["/"]);
								},
								() => {
									this.handleErrorWhileCreatingFlow(
										this.flow.id,
										this.step.id,
									);
								},
							);
					},
					() => {
						this.handleErrorWhileCreatingFlow(this.flow.id, this.step.id);
					},
				);
  }

	setDataFromForm(): void {
		const flowControls = this.editFlowForm.controls;

		flowControls.name.markAsTouched();
		flowControls.name.updateValueAndValidity();

		this.flow.id = flowControls.id.value;
		this.flow.name = flowControls.name.value;
		this.flow.logLevel = flowControls.logLevel.value;
		this.flow.notes = flowControls.notes.value;
		this.flow.gatewayId = flowControls.gateway.value;

		(<FormArray>flowControls.stepsData).controls.forEach(
			(step, index) => {
				this.setDataFromFormOnStep(
					this.steps[index],
					(<FormGroup>step).controls,
				);
			},
		);
	}

	setDataFromFormOnStep(step, formStepData) {
		step.id = formStepData.id.value;
    step.componentType = formStepData.componentType.value;
    step.stepType = formStepData.stepType.value;
		step.uri = formStepData.uri.value;
    step.headerId = formStepData.header.value;
		step.routeId = formStepData.route.value;
		step.connectionId = formStepData.connection.value;

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

  checkForm(){
      this.steps.forEach(
      				(step: Step) => {
      					if(step.routeId == null && step.stepType === StepType.ROUTE){
                    this.savingFlowFailedMessage = 'Routes cannot be empty.';
                    this.savingFlowFailed = true;
      					}
      				},
      );
  }

	private subscribeToSaveResponse(result: Observable<Flow>): void {
		result.subscribe(
			(res: Flow) => this.onSaveSuccess(res),
			(res: Response) => this.onSaveError(),
		);
	}

	private onSaveSuccess(result: Flow): void {
		this.eventManager.broadcast(
			new EventWithContent("flowListModification", "OK"),
		);
		this.isSaving = false;
	}

	private onSaveError(): void {
		this.isSaving = false;
	}

	private onError(error): void {
		this.alertService.addAlert({ type: "danger", message: error.message });
	}

	openModal(templateRef: TemplateRef<any>): void {
		this.modalRef = this.modalService.open(templateRef);
	}

	openFullScreenModal(templateRef: TemplateRef<any>): void {
  		this.modalRef = this.modalService.open(templateRef, { windowClass: 'fullscreen-modal'});
  }

	cancelModal(): void {
		this.modalRef.dismiss();
		this.modalRef = null;
	}

	  openTestConnectionModal(templateRef: TemplateRef<any>) {
      this.initializeTestConnectionForm();
      this.testConnectionMessage = '';
      this.modalRef = this.modalService.open(templateRef);
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


	ngOnDestroy() {
		this.subscription.unsubscribe();
		this.eventManager.destroy(this.eventSubscriber);
	}

	registerChangeInFlows(): void {
		this.eventSubscriber =
			this.eventManager.subscribe(
				"flowListModification",
				(response) => {
					this.load(this.flow.id);
				},
			);
	}

	getElementByXpath(xml, path) {
    return document.evaluate(path, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

}

export class Option {
  constructor(public key?: string, public value?: string) {}
}
