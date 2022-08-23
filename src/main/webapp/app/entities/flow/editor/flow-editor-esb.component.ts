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
import { forkJoin, Observable, Subscription } from "rxjs";
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
	steps: IStep[] = new Array<Step>();
	step: IStep;

	public stepTypes = ["ROUTE", "ERROR"];

	public logLevelListType = [
		LogLevelType.OFF,
		LogLevelType.INFO,
		LogLevelType.ERROR,
		LogLevelType.TRACE,
		LogLevelType.WARN,
		LogLevelType.DEBUG,
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

	selectedComponentType: string;

	componentTypeAssimblyLinks: Array<string> = new Array<string>();
	componentTypeCamelLinks: Array<string> = new Array<string>();
	uriPlaceholders: Array<string> = new Array<string>();

	consumerComponentsNames: Array<any> = [];
	producerComponentsNames: Array<any> = [];

	editFlowForm: FormGroup;
	invalidUriMessage: string;
	notUniqueUriMessage: string;

  filterConnection: Array<Array<Connection>> = [[]];
  connectionType: Array<string> = [];
  selectedConnection: Connection = new Connection();

	numberOfRouteSteps = 0;

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
																this.step =
																	new Step(
																		step.id,
																		step.stepType,
																		step.flowId,
																		step.routeId,
								                    step.connectionId,
																	);

																this.steps.push(step);

																const formgroup = this.initializeStepData(
																	step,
																);
																(
																	<FormArray>this.editFlowForm.controls.stepsData
																).insert(index, formgroup);

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
								this.flow.type = "esb";
								this.flow.notes = "";
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

								this.numberOfRouteSteps = 1;

								// create new route step
								this.step = new Step();
								this.step.id = null;
								this.step.stepType = StepType.ROUTE;
								this.step.componentType = "file";
								this.step.routeId = null;
								this.step.connectionId = null;

								this.steps.push(this.step);

								const formgroupRoute = this.initializeStepData(
									this.step,
								);
								(<FormArray>this.editFlowForm.controls.stepsData).push(
									formgroupRoute,
								);

								// create new error step
								this.step = new Step();
								this.step.id = null;
								this.step.stepType = StepType.ERROR;
								this.step.componentType = "file";
								this.step.routeId = null;

								this.steps.push(this.step);

								const formgroupError = this.initializeStepData(
									this.step,
								);
								(<FormArray>this.editFlowForm.controls.stepsData).push(
									formgroupError,
								);

								this.finished = true;
							},
							0,
						);
					}

					this.active = "0";
				},
			);
	}

	setComponents(): void {
		const producerComponents = this.components.types.filter(function (component) {
			return component.consumerOnly === false;
		});

		const consumerComponents = this.components.types.filter(function (component) {
			return component.producerOnly === false;
		});

		this.producerComponentsNames =
			producerComponents.map((component) => component.name);
		this.producerComponentsNames.sort();

		this.consumerComponentsNames =
			consumerComponents.map((component) => component.name);
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

	setPopoverMessages(): void {
		this.namePopoverMessage =
			`Name of the flow. Usually the name of the message type like <i>order</i>.<br/><br>Displayed on the <i>flows</i> page.`;
		this.errorHandlerPopoverMessage =
			`Route or RouteConfiguration that handles errors in case of failures.`;
		this.logLevelPopoverMessage = `Sets the log level (default=OFF). This automatically log headers and body of the first and last step of a route`;
		this.notesPopoverMessage = `Notes to document the flow.`;
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
			type: new FormControl(step.stepType),
			route: new FormControl(step.routeId),
			connection: new FormControl(step.connectionId),
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
			stepType: step.stepType,
			componentType: step.componentType,
			route: step.routeId,
			connection: step.connectionId,
		});
	}

	addStep(step, index): void {

		let newIndex = index + 1;

		if (step.responseId !== undefined) {
			newIndex += 1;
		}

		this.steps.splice(newIndex, 0, new Step());

		if (step.stepType === "ROUTE") {
			this.numberOfRouteSteps = this.numberOfRouteSteps + 1;
		}

		const newStep = this.steps.find((e, i) => i === newIndex);

		newStep.stepType = step.stepType;
		newStep.componentType =	this.gateways[this.indexGateway].defaultToComponentType;

		(<FormArray>this.editFlowForm.controls.stepsData).insert(
			newIndex,
			this.initializeStepData(newStep),
		);

		this.active = newIndex.toString();
	}

	removeStep(step, index): void {

		if (index === 0) {
  			return;
 		}

		if (step.stepType === "ROUTE") {
			this.numberOfRouteSteps = this.numberOfRouteSteps - 1;
		}

		const i = this.steps.indexOf(step);
		this.steps.splice(i, 1);
		this.editFlowForm.removeControl(index);
		(<FormArray>this.editFlowForm.controls.stepsData).removeAt(i);
	}

  // this filters connections not of the correct type
  filterConnections(step: any, formService: FormControl): void {

    //this.connectionType[this.steps.indexOf(step)] = this.connectionsList.getConnectionType(step.componentType);
    this.filterConnection[this.steps.indexOf(step)] = this.connections;

    /*
    this.filterConnection[this.steps.indexOf(step)] = this.connections.filter(
      f => f.type === this.connectionType[this.steps.indexOf(step)]
    );

    if (this.filterConnection[this.steps.indexOf(step)].length > 0 && step.connectionId) {
      formService.setValue(this.filterConnection[this.steps.indexOf(step)].find(fs => fs.id === step.connectionId).id);
    }*/
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
                console.log('createConnection reason: ' + reason);
              }
          );

       }, (reason)=>{
          console.log('createConnection reason: ' + reason);
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

	cancelModal(): void {
		this.modalRef.dismiss();
		this.modalRef = null;
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
}
