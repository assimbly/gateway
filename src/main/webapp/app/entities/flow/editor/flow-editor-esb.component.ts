import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "app/core/util/alert.service";
import { EventManager, EventWithContent } from "app/core/util/event-manager.service";
import { RouteDialogComponent } from "app/entities/route/route-dialog.component";
import { RoutePopupService } from "app/entities/route/route-popup.service";
import { Components } from "app/shared/camel/component-type";
import { Services } from "app/shared/camel/service-connections";
import { Endpoint, EndpointType, IEndpoint } from "app/shared/model/endpoint.model";
import { Flow, IFlow, LogLevelType } from "app/shared/model/flow.model";
import { Gateway } from "app/shared/model/gateway.model";
import { Route } from "app/shared/model/route.model";
import dayjs from "dayjs/esm";
import { forkJoin, Observable, Subscription } from "rxjs";
import { EndpointService } from "../../endpoint/endpoint.service";
import { GatewayService } from "../../gateway/gateway.service";
import { RouteService } from "../../route/route.service";
import { FlowService } from "../flow.service";

@Component({
  selector: 'jhi-flow-editor-esb',
  templateUrl: './flow-editor-esb.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class FlowEditorEsbComponent implements OnInit, OnDestroy {
	flow: IFlow;
	routes: Route[];

	URIList: Array<Array<Endpoint>> = [[]];
	allendpoints: IEndpoint[] = new Array<Endpoint>();
	endpoints: IEndpoint[] = new Array<Endpoint>();
	endpoint: IEndpoint;

	public endpointTypes = ["ROUTE", "ERROR"];

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
	activeEndpoint: any;

	isSaving: boolean;
	savingFlowFailed = false;
	savingFlowFailedMessage = "Saving failed (check logs)";
	savingFlowSuccess = false;
	savingFlowSuccessMessage = "Flow successfully saved";
	savingCheckEndpoints = true;

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

	numberOfRouteEndpoints = 0;

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
		private routeService: RouteService,
		private alertService: AlertService,
		private route: ActivatedRoute,
		private router: Router,
		public servicesList: Services,
		public components: Components,
		private modalService: NgbModal,
		private routePopupService: RoutePopupService,
	) {}

	ngOnInit(): void {
		this.isSaving = false;
		this.createRoute = 0;

		this.setPopoverMessages();

		this.setComponents();

		this.subscription =
			this.route.params.subscribe(
				(params) => {
					this.activeEndpoint = params["endpointid"];

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
			this.gatewayService.query(),
			this.endpointService.query(),
			this.flowService.getGatewayName(),
		])
			.subscribe(
				([wikiDocUrl, camelDocUrl, routes, gateways, allendpoints, gatewayName]) => {
					this.wikiDocUrl = wikiDocUrl.body;
					this.camelDocUrl = camelDocUrl.body;

					this.routes = routes.body;
					this.routeCreated = this.routes.length > 0;

					this.gateways = gateways.body;
					this.singleGateway = this.gateways.length === 1;
					this.gatewayName = gatewayName.body;

					this.allendpoints = allendpoints.body;

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

									this.endpointService
										.findByFlowId(id)
										.subscribe(
											(flowEndpointsData) => {
												const endpoints = flowEndpointsData.body;
												let index = 0;
												this.endpoints = [];

												this.endpointTypes.forEach(
													(endpointType, j) => {
														let filteredEndpoints = endpoints.filter(
															(endpoint) =>
																endpoint.endpointType === endpointType,
														);

														filteredEndpoints.forEach(
															(endpoint) => {
																this.endpoint =
																	new Endpoint(
																		endpoint.id,
																		endpoint.endpointType,
																		endpoint.flowId,
																		endpoint.routeId,
																	);

																this.endpoints.push(endpoint);

																const formgroup = this.initializeEndpointData(
																	endpoint,
																);
																(
																	<FormArray>this.editFlowForm.controls.endpointsData
																).insert(index, formgroup);

																index = index + 1;
															},
															this,
														);
													},
													this,
												);

												if (this.activeEndpoint) {
													const activeIndex = this.endpoints.findIndex(
														(item) => item.id.toString() === this.activeEndpoint,
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

								this.numberOfRouteEndpoints = 1;

								// create new route endpoint
								this.endpoint = new Endpoint();
								this.endpoint.id = null;
								this.endpoint.endpointType = EndpointType.ROUTE;
								this.endpoint.componentType = "file";
								this.endpoint.routeId = null;

								this.endpoints.push(this.endpoint);

								const formgroupRoute = this.initializeEndpointData(
									this.endpoint,
								);
								(<FormArray>this.editFlowForm.controls.endpointsData).push(
									formgroupRoute,
								);

								// create new error endpoint
								this.endpoint = new Endpoint();
								this.endpoint.id = null;
								this.endpoint.endpointType = EndpointType.ERROR;
								this.endpoint.componentType = "file";
								this.endpoint.routeId = null;

								this.endpoints.push(this.endpoint);

								const formgroupError = this.initializeEndpointData(
									this.endpoint,
								);
								(<FormArray>this.editFlowForm.controls.endpointsData).push(
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
		this.flow.endpoints = null;

		this.endpoints.forEach((endpoint) => {
			endpoint.id = null;
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
				endpointsData: new FormArray([]),
			});
	}

	initializeEndpointData(endpoint: Endpoint): FormGroup {
		return new FormGroup({
			id: new FormControl(endpoint.id),
			type: new FormControl(endpoint.endpointType),
			route: new FormControl(endpoint.routeId),
		});
	}

	updateForm(): void {
		this.updateFlowData(this.flow);

		const endpointsData = this.editFlowForm.controls.endpointsData as FormArray;
		this.endpoints.forEach(
			(endpoint, i) => {
				this.updateEndpointData(
					endpoint,
					endpointsData.controls[i] as FormControl,
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

	updateEndpointData(endpoint: any, endpointData: FormControl): void {
		endpointData.patchValue({
			id: endpoint.id,
			endpointType: endpoint.endpointType,
			route: endpoint.routeId,
		});
	}

	addEndpoint(endpoint, index): void {

		let newIndex = index + 1;

		if (endpoint.responseId !== undefined) {
			newIndex += 1;
		}

		this.endpoints.splice(newIndex, 0, new Endpoint());

		if (endpoint.endpointType === "ROUTE") {
			this.numberOfRouteEndpoints = this.numberOfRouteEndpoints + 1;
		}

		const newEndpoint = this.endpoints.find((e, i) => i === newIndex);

		newEndpoint.endpointType = endpoint.endpointType;
		newEndpoint.componentType =
			this.gateways[this.indexGateway].defaultToComponentType;

		(<FormArray>this.editFlowForm.controls.endpointsData).insert(
			newIndex,
			this.initializeEndpointData(newEndpoint),
		);

		this.active = newIndex.toString();
	}

	removeEndpoint(endpoint, index): void {

		if (index === 0) {
  			return;
 		}

		if (endpoint.endpointType === "ROUTE") {
			this.numberOfRouteEndpoints = this.numberOfRouteEndpoints - 1;
		}

		const i = this.endpoints.indexOf(endpoint);
		this.endpoints.splice(i, 1);
		this.editFlowForm.removeControl(index);
		(<FormArray>this.editFlowForm.controls.endpointsData).removeAt(i);
	}

	createOrEditRoute(endpoint, formRoute: FormControl): void {
		endpoint.routeId = formRoute.value;

		if (
			typeof endpoint.routeId === "undefined" ||
			endpoint.routeId === null ||
			!endpoint.routeId
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
							this.setRoute(endpoint, result.id, formRoute);
						},
						(reason) => {
							this.setRoute(endpoint, reason.id, formRoute);
						},
					);
				},
			);
		} else {
			const modalRef = this.routePopupService.open(
				RouteDialogComponent as Component,
				endpoint.routeId,
				this.flow.type
			);
			modalRef.then(
				(res) => {
					// Success
					res.result.then(
						(result) => {
							this.setRoute(endpoint, result.id, formRoute);
						},
						(reason) => {
							this.setRoute(endpoint, reason.id, formRoute);
						},
					);
				},
			);
		}
	}

	setRoute(endpoint, id, formRoute: FormControl): void {
		this.routeService
			.getAllRoutes()
			.subscribe(
				(res) => {
					this.routes = res.body;
					this.routeCreated = this.routes.length > 0;
					endpoint.routeId = id;

					if (formRoute.value === null) {
						formRoute.patchValue(id);
					}
					endpoint = null;
				},
				(res) => this.onError(res.body),
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

	save(): any {
		this.setDataFromForm();
		this.setVersion();

		this.savingFlowFailed = false;
		this.savingFlowSuccess = false;
		const goToOverview = true;

		if (!this.editFlowForm.valid) {
			return;
		}

		if (this.flow.id) {
			this.endpoints.forEach(
				(endpoint) => {
					endpoint.flowId = this.flow.id;
				},
			);

			this.flowService
				.update(this.flow)
				.subscribe(
					(flow) => {
						this.flow = flow.body;
						const updateEndpoints = this.endpointService.updateMultiple(
							this.endpoints,
						);

						updateEndpoints.subscribe(
							(results) => {
								this.endpoints = results.body.concat();

								this.updateForm();

								this.endpointService
									.findByFlowId(this.flow.id)
									.subscribe(
										(data) => {
											let endpoints = data.body;
											endpoints =
												endpoints.filter(
													(e) => {
														const s = this.endpoints.find((t) => t.id === e.id);
														if (typeof s === "undefined") {
															return true;
														} else {
															return s.id !== e.id;
														}
													},
												);

											if (endpoints.length > 0) {
												endpoints.forEach(
													(element) => {
														this.endpointService.delete(element.id).subscribe();
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
		} else {
			this.flow.gatewayId = this.gateways[0].id;

			this.flowService
				.create(this.flow)
				.subscribe(
					(flowUpdated) => {
						this.flow = flowUpdated.body;

						this.endpoints.forEach(
							(endpoint) => {
								endpoint.flowId = this.flow.id;
							},
						);

						this.endpointService
							.createMultiple(this.endpoints)
							.subscribe(
								(toRes) => {
									this.endpoints = toRes.body;
									this.updateForm();
									this.finished = true;
									this.savingFlowSuccess = true;
									this.isSaving = false;
									this.router.navigate(["/"]);
								},
								() => {
									this.handleErrorWhileCreatingFlow(
										this.flow.id,
										this.endpoint.id,
									);
								},
							);
					},
					() => {
						this.handleErrorWhileCreatingFlow(this.flow.id, this.endpoint.id);
					},
				);
		}
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

		(<FormArray>flowControls.endpointsData).controls.forEach(
			(endpoint, index) => {
				this.setDataFromFormOnEndpoint(
					this.endpoints[index],
					(<FormGroup>endpoint).controls,
				);
			},
		);
	}

	setDataFromFormOnEndpoint(endpoint, formEndpointData) {
		endpoint.id = formEndpointData.id.value;
		endpoint.routeId = formEndpointData.route.value;
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
