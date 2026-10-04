import { ChangeDetectorRef, Component, DestroyRef, ElementRef, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation, inject } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { NgbModal, NgbModalRef, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { PopoverModule } from "ngx-bootstrap/popover";
import { AlertService } from "app/core/util/alert.service";
import { FlowEditorStepComponent, StepEditorRegistry } from "./flow-editor-step.component";
import { AlertError } from "app/shared/alert";
import { EventManager, EventWithContent } from "app/core/util/event-manager.service";
import { MessageDialogComponent } from 'app/entities/message/message-dialog.component';
import { MessagePopupService } from 'app/entities/message/message-popup.service';
import { RouteDialogComponent } from "app/entities/route/route-dialog.component";
import { RoutePopupService } from "app/entities/route/route-popup.service";
import { ConnectionDialogComponent } from 'app/entities/connection/connection-dialog.component';
import { ConnectionPopupService } from 'app/entities/connection/connection-popup.service';
import { Components } from "app/shared/camel/component-type";
import { Connections } from "app/shared/camel/connections";
import { Link, ILink } from "app/shared/model/link.model";
import { Step, StepType, IStep } from "app/shared/model/step.model";
import { Flow, IFlow, LogLevelType } from "app/shared/model/flow.model";
import { Integration } from "app/shared/model/integration.model";
import { IMessage } from 'app/shared/model/message.model';
import { Route } from "app/shared/model/route.model";
import { Connection } from 'app/shared/model/connection.model';
import dayjs from "dayjs/esm";
import { from, forkJoin, Observable, of, Subscription } from "rxjs";
import { map, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LinkService } from "../../link/link.service";
import { StepService } from "../../step/step.service";
import { MessageService } from '../../message/message.service';
import { IntegrationService } from "../../integration/integration.service";
import { RouteService } from "../../route/route.service";
import { ConnectionService } from '../../connection/connection.service';
import { FlowService } from "../flow.service";
import { FieldTabDirective } from "app/shared/form/field-tab.directive";
import { CodemirrorModule } from "@ctrl/ngx-codemirror";
import { ThemeService } from "app/core/theme";
import { FlowCanvasComponent, DesignerSelection } from "../designer/flow-canvas.component";
import { FlowEditorHeaderComponent } from "./flow-editor-header.component";
import { LinkEditorComponent } from "../designer/link-editor.component";
import { FlowGraphHistory } from "../designer/flow-graph-history";
import {
  addBranch,
  appendStep,
  autoArrange,
  canDeleteStep,
  deleteBranch,
  deleteStep,
  DesignLink,
  EditResult,
  FlowGraph,
  insertStep,
  isDraft,
  LinkSettings,
  linksToSave,
  loadFlowGraph,
  moveStep,
  opensOnCanvas,
  Problem,
  problems,
  routerKind,
  stepsToSave,
  updateLink,
} from "../designer/flow-graph";

@Component({
  selector: 'jhi-flow-editor-esb',
  templateUrl: './flow-editor-esb.component.html',
  styleUrl: '../designer/flow-designer.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [StepEditorRegistry],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgbModule, FontAwesomeModule, PopoverModule, AlertError, FlowEditorStepComponent, FieldTabDirective, CodemirrorModule, FlowCanvasComponent, LinkEditorComponent, FlowEditorHeaderComponent],
})
export class FlowEditorEsbComponent implements OnInit, OnDestroy {

	private readonly themeService = inject(ThemeService);
	private notesOptionsTheme = '';
	private notesOptionsCache: Record<string, unknown> | null = null;
	flow: IFlow;

	notesEditorOptions(): Record<string, unknown> {
		const theme = this.themeService.editorTheme();
		if (this.notesOptionsCache && this.notesOptionsTheme === theme) {
			return this.notesOptionsCache;
		}
		this.notesOptionsTheme = theme;
		this.notesOptionsCache = {
			lineNumbers: true,
			gutters: ['CodeMirror-linenumbers'],
			lineWrapping: true,
			mode: 'text',
			theme,
		};
		return this.notesOptionsCache;
	}

	refreshCodeMirror(editor: { codeMirror?: { refresh: () => void } }): void {
		const codeMirror = editor?.codeMirror;
		if (!codeMirror) {
			return;
		}
		const refresh = () => codeMirror.refresh();
		requestAnimationFrame(() => {
			refresh();
			setTimeout(refresh);
		});
	}
	@ViewChild(FlowEditorHeaderComponent) header?: FlowEditorHeaderComponent;
	/** Set by Save & start: start the Flow once it is saved. */
	private startAfterSave = false;
	private readonly location = inject(Location);
	routes: Route[];
	messages: IMessage[];
	connections: Connection[];

	URIList: Array<Array<Step>> = [[]];
	allsteps: IStep[] = new Array<Step>();
  stepsOptions: Array<Array<Option>> = [[]];
	steps: IStep[] = new Array<Step>();
	stepsToDelete: IStep[] = new Array<Step>();
	step: IStep;

  public stepTypes = ["SOURCE", "ACTION", "SINK", "ROUTE", "SCRIPT", "CONNECTION", "ERROR"];
  public languageComponentsNames: Array<any> = ['groovy', 'python', 'javascript', 'simple', 'jslt','xslt'];
  public componentsWithConnection: Array<any> = ['activemq','amazonmq','amqp','amqps','jms','sjms','sjms2','sql','ibmmq','spring-rabbitmq'];

	public logLevelListType = [
		LogLevelType.OFF,
		LogLevelType.TRACE,
	];

	panelCollapsed: any = "uno";
	public isCollapsed = true;
	active: string;
	active2: any;
	disabled = true;
	activeStep: any;
	activeEditor: string;

	isSaving: boolean;
	savingFlowFailed = false;
	savingFlowFailedMessage = "Saving failed (check logs)";
	savingFlowSuccess = false;
	savingFlowSuccessMessage = "Flow successfully saved";
	savingCheckSteps = true;

	finished = false;
	nameFieldReady = false;
	formSubmitted = false;

	integrations: Integration[];
	configuredIntegration: Integration;
	integrationName: string;
	singleIntegration = false;
	indexIntegration: number;

	createRoute: number;
	predicate: any;
	reverse: any;

	routeCreated: boolean;
  connectionCreated: boolean;
  messageCreated: boolean;
  errorStep: boolean = true;

	namePopoverMessage: string;
	logLevelPopoverMessage: string;
	errorHandlerPopoverMessage: string;
	notesPopoverMessage: string;

  componentPopoverMessage: string;
	optionsPopoverMessage: string;
	messagePopoverMessage: string;
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

	editFlowForm: FormGroup;
	invalidUriMessage: string;
	notUniqueUriMessage: string;

    filterConnection: Array<Array<Connection>> = [[]];
    connectionType: Array<string> = [];
    selectedConnection: Connection = new Connection();

    enableConnection: Array<boolean> = [];
    enableMessage: Array<boolean> = [];

	numberOfSteps = 0;

	modalRef: NgbModalRef | null;
	modalRefPromise: Promise<NgbModalRef> | null;

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

	private readonly destroyRef = inject(DestroyRef);

	constructor(
		private eventManager: EventManager,
		private integrationService: IntegrationService,
		private flowService: FlowService,
		private stepService: StepService,
		private linkService: LinkService,
		private messageService: MessageService,
		private routeService: RouteService,
    private connectionService: ConnectionService,
		private alertService: AlertService,
		private route: ActivatedRoute,
		private router: Router,
		public connectionsList: Connections,
		public components: Components,
		private modalService: NgbModal,
		private messagePopupService: MessagePopupService,
		private routePopupService: RoutePopupService,
    private connectionPopupService: ConnectionPopupService,
		private cdr: ChangeDetectorRef,
		private stepEditorRegistry: StepEditorRegistry,
	) {}

	ngOnInit(): void {

		this.isSaving = false;
		this.createRoute = 0;

		this.setPopoverMessages();

		this.setComponents();

		this.subscription =
			this.route.queryParams.subscribe(
				(params) => {
					const nextEditor = params["editor"];
					const editorChanged = !params["id"] && !!this.activeEditor && this.activeEditor !== nextEditor;

					this.activeStep = params["stepid"];
					this.activeEditor = nextEditor;

					if (editorChanged) {
						this.resetNewFlowEditor();
					}

					if (params["mode"] === "clone") {
						this.load(params["id"], true);
					} else {
						this.load(params["id"], false);
					}
				},
			);

		this.registerChangeInFlows();

	}

	private resetNewFlowEditor(): void {
		this.finished = false;
		this.nameFieldReady = false;
		this.formSubmitted = false;
		this.steps = [];
		this.stepsOptions = [[]];
		this.componentOptions = [];
		this.selectedOptions = [[]];
		this.numberOfSteps = 0;
		this.componentTypeCamelLinks = [];
		this.componentTypeAssimblyLinks = [];
		this.uriPlaceholders = [];
		this.uriPopoverMessages = [];
		this.enableConnection = [];
		this.enableMessage = [];
		this.URIList = [[]];
		this.filterConnection = [[]];
	}

	load(id, isCloning?: boolean): void {

		forkJoin([
			this.flowService.getWikiDocUrl(),
			this.flowService.getCamelDocUrl(),
			this.messageService.getAllMessages(),
			this.routeService.getAllRoutes(),
      this.connectionService.getAllConnections(),
			this.integrationService.query(),
			this.stepService.query(),
			this.flowService.getIntegrationName(),
		])
			.subscribe(
				([wikiDocUrl, camelDocUrl, messages, routes, connections, integrations, allsteps, integrationName]) => {

					this.wikiDocUrl = wikiDocUrl.body;
					this.camelDocUrl = camelDocUrl.body;

          this.messages = messages.body;
          this.messageCreated = this.messages.length > 0;

					this.routes = routes.body;
					this.routeCreated = this.routes.length > 0;

          this.connections = connections.body;
          this.connectionCreated = this.connections.length > 0;

					this.integrations = integrations.body;
					this.singleIntegration = this.integrations.length === 1;
					this.integrationName = integrationName.body;

					this.allsteps = allsteps.body;

					if (this.singleIntegration) {
						this.indexIntegration = 0;
					} else {
						this.indexIntegration =
							this.integrations.findIndex(
								(integration) => integration.name === this.integrationName,
							);
					}

					if (id) {
						this.flowService
							.find(id)
							.subscribe(
								(flow) => {
									this.flow = flow.body;
									if (this.singleIntegration) {
										this.flow.integrationId = this.integrations[this.indexIntegration].id;
									}

									this.initializeForm(this.flow);

                  if (this.useCanvas) {
                    this.loadDesigner(this.flow);
                  } else {
                    this.loadSteps();
                  }

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
                  this.cdr.detectChanges();
                  this.focusFlowNameIfEmpty();

								},
							);
					} else if (!this.finished) {
								// create new flow object
								this.flow = new Flow();
								this.flow.type = this.activeEditor;
								this.flow.notes = '';
								this.flow.autoStart = false;
								this.flow.parallelProcessing = false;
								this.flow.maximumRedeliveries = 0;
								this.flow.redeliveryDelay = 3000;
								this.flow.logLevel = LogLevelType.OFF;
								if (this.singleIntegration) {
									this.indexIntegration = 0;
									this.flow.integrationId = this.integrations[this.indexIntegration].id;
								} else {
									this.configuredIntegration =
										this.integrations.find(
											(integration) => integration.name === this.integrationName,
										);
									this.indexIntegration =
										this.integrations.findIndex(
											(integration) => integration.name === this.integrationName,
										);
									this.flow.integrationId = this.configuredIntegration.id;
								}

								this.initializeForm(this.flow);

								this.numberOfSteps = 1;

								// create new route step
                if(this.useCanvas){
                    this.loadDesigner(this.flow);
                }else if(this.activeEditor === 'flow'){
                    this.createNewStep(StepType.SOURCE,this.integrations[0].defaultFromComponentType,0);
                    this.createNewStep(StepType.SINK,this.integrations[0].defaultToComponentType,1);
                    this.createNewStep(StepType.ERROR,this.integrations[0].defaultErrorComponentType,2);
                }else if(this.activeEditor === 'script'){
                    this.createNewStep(StepType.SOURCE,'scheduler',0);
                    this.createNewStep(StepType.SCRIPT,'groovy',1);
                    this.createNewStep(StepType.ERROR,this.integrations[0].defaultErrorComponentType,2);
                }else if(this.activeEditor === 'route'){
                    this.createNewStep(StepType.ROUTE,'',0);
                    this.createNewStep(StepType.ERROR,'',1);
                }

								this.finished = true;
								this.cdr.detectChanges();
								this.focusFlowNameIfEmpty();
					}

					this.active = "0";
				},
			);
	}

  loadSteps(){

      if(this.flow.steps.length > 0){

        this.steps = [];

        let startStep = this.flow.steps.find(step => step.stepType === 'SOURCE');

        if(!startStep){
          startStep = this.flow.steps.reduce((min, step) => step.id < min.id ? step : min, this.flow.steps[0]);
        }

        this.loadStep(startStep, 0);

      }

  }

  loadStep(step: IStep, index: number){

        this.numberOfSteps = this.numberOfSteps + 1;

        if (typeof this.stepsOptions[index] === 'undefined') {
          this.stepsOptions.push([]);
        }

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

        if(step.connectionId){
          this.enableConnection[index] = true;
        }else{
          this.enableConnection[index] = false;
        }

        if(step.messageId){
          this.enableMessage[index] = true;
        }else{
          this.enableMessage[index] = false;
        }

        const nextStep = this.findNextStep(step);
        if (nextStep) {
          index = index + 1;
          //recursively call itself when nextStep is found
          this.loadStep(nextStep, index);
        }

       // Add error step as last step
       if(this.errorStep){
           this.errorStep = false;
           const lastStep = this.flow.steps.find(step => step.stepType === 'ERROR');
           this.loadStep(lastStep, index + 1);
       }

  }

  findNextStep(current: IStep): IStep | undefined {
    const loadedIds = new Set((this.steps || []).map(s => s.id));
    const links = current?.links || [];
    const outLinkName = links
      .filter(l => l.bound === 'out')
      .map(l => l.name);

    // Primary: follow SOURCE/ACTION out → next in
    let next = this.flow.steps.find(s =>
      !loadedIds.has(s.id) &&
      s.stepType !== 'ERROR' &&
      (s.links || []).some(l => l.bound === 'in' && outLinkName.includes(l.name))
    );

    // Fallback: expected link name {flowId}-{currentId} on any link (legacy / partial link data)
    if (!next && current?.id != null && this.flow?.id != null) {
      const expectedName = this.flow.id + '-' + current.id;
      next = this.flow.steps.find(s =>
        !loadedIds.has(s.id) &&
        s.stepType !== 'ERROR' &&
        (s.links || []).some(l => l.name === expectedName)
      );
    }

    // Fallback: orphaned steps with missing links — continue by id among remaining non-ERROR
    if (!next) {
      const remaining = this.flow.steps
        .filter(s => !loadedIds.has(s.id) && s.stepType !== 'ERROR')
        .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
      next = remaining[0];
    }

    return next;
  }

  createNewStep(stepType: StepType, defaultComponentType: string, index: number){

		this.steps.splice(index, 0, new Step());
    this.stepsOptions.splice(index, 0, [new Option()]);
    this.componentOptions.splice(index, 0, []);

		this.numberOfSteps = this.numberOfSteps + 1;

		const newStep = this.steps.find((e, i) => i === index);

    newStep.stepType = stepType;
    newStep.componentType = defaultComponentType;

		(<FormArray>this.editFlowForm.controls.stepsData).insert(
			index,
			this.initializeStepData(newStep),
		);

    // Pass component type as change event so options load for the default component
    this.setTypeLinks(newStep, index, defaultComponentType as any);

    const optionArray: Array<string> = [];
    optionArray.splice(0, 0, '');
    this.selectedOptions.splice(index, 0, optionArray);

    this.enableConnection[index] = false;
    this.enableMessage[index] = false;

		this.active = index.toString();

  }

  setTypeLinks(step: any, stepFormIndex?, e?: Event): void {

    const stepForm = <FormGroup>(<FormArray>this.editFlowForm.controls.stepsData).controls[stepFormIndex];

    if (typeof e !== 'undefined') {

      // set componenttype to selected component and clear other fields
      step.componentType = e;
      step.uri = null;
      step.messageId = '';
      step.routeId = '';
      step.connectionId = '';

      if(Object.keys(step.stepType).length === 0){
         step.stepType = 'SOURCE';
      }

      let i;
      const numberOfOptions = this.stepsOptions[stepFormIndex].length - 1;
      for (i = numberOfOptions; i > 0; i--) {
        this.stepsOptions[stepFormIndex][i] = null;
        this.removeOption(this.stepsOptions[stepFormIndex], this.stepsOptions[stepFormIndex][i], stepFormIndex);
      }

      stepForm.controls.uri.patchValue(step.uri);
      stepForm.controls.message.patchValue(step.messageId);
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

    if(step.stepType === 'SOURCE' || step.stepType === 'ACTION' || step.stepType === 'SINK' || step.stepType === 'ROUTER' || step.stepType === 'ERROR'){

        const type = this.components.types.find(component => component.name === componentType);

        if (type) {
        this.componentTypeAssimblyLinks[stepFormIndex] = this.wikiDocUrl + '/component-' + componentType;
        this.componentTypeCamelLinks[stepFormIndex] = this.camelDocUrl + '/' + camelComponentType + '-component.html';

        this.uriPlaceholders[stepFormIndex] = type.syntax;
        this.uriPopoverMessages[stepFormIndex] = type.description;

        // set options keys
        if (typeof e !== 'undefined' && camelComponentType) {
          this.setComponentOptions(step, camelComponentType, stepFormIndex).subscribe(data => {
            // add custom options if available
            this.customOptions.forEach(customOption => {
              if (customOption.componentType === camelComponentType) {
                this.componentOptions[stepFormIndex].push(customOption);
              }
            });
          });
        }

        if(componentType === 'setheaders' || componentType === 'setmessage'){
          this.enableMessage[stepFormIndex] = true;
        }else{
          this.enableMessage[stepFormIndex] = false;
        }

        if(this.componentsWithConnection.includes(componentType)){
          this.enableConnection[stepFormIndex] = true;
          this.filterConnections(componentType, stepFormIndex);
        }else{
          this.enableConnection[stepFormIndex] = false;
        }

        }

    }

    if(stepForm){
      stepForm.patchValue({ string: componentType });
    }

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

	private focusFlowNameIfEmpty(): void {
		setTimeout(() => {
			if (!this.editFlowForm?.controls.name.value) {
				this.header?.focusName();
			}
			this.editFlowForm?.controls.name.markAsPristine();
			this.editFlowForm?.controls.name.markAsUntouched();
			this.nameFieldReady = true;
			this.cdr.detectChanges();
		});
	}

	private refreshStepEditors(): void {
		this.stepEditorRegistry.refresh();
	}

  setStepComponent(step: IStep, stepFormIndex: number, stepType: string): void {

    const stepForm = <FormGroup>(<FormArray>this.editFlowForm.controls.stepsData).controls[stepFormIndex];

    if(stepType === 'SCRIPT'){
        step.componentType = 'groovy';
        stepForm.controls.componentType.patchValue(step.componentType);
    }else if(stepType === 'ACTION'){
             step.componentType = 'log';
             stepForm.controls.componentType.patchValue(step.componentType);
    }else{
       // if(integration.get)
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

    this.componentPopoverMessage = `The component to use (scheme). Click on the docs icon for online documentation.`;
    this.optionsPopoverMessage = `Options for the selected component. Hover the option for more information.`;
    this.optionsPopoverMessage = ``;
    this.messagePopoverMessage = `A group of key/value pairs to add to the message header.<br/><br/> Use the button on the right to create or edit a header.`;
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
				parallelProcessing: new FormControl(flow.parallelProcessing),
				maximumRedeliveries: new FormControl(flow.maximumRedeliveries),
				redeliveryDelay: new FormControl(flow.redeliveryDelay),
				logLevel: new FormControl(flow.logLevel),
				integration: new FormControl(flow.integrationId),
				stepsData: new FormArray([]),
			});
	}

	stepFormAt(index: number): FormGroup {
		return (this.editFlowForm.get('stepsData') as FormArray).at(index) as FormGroup;
	}

	initializeStepData(step: Step): FormGroup {
		return new FormGroup({
			id: new FormControl(step.id),
      componentType: new FormControl(step.componentType),
			stepType: new FormControl(step.stepType),
      uri: new FormControl(step.uri),
      options: new FormArray([this.initializeOption()]),
      message: new FormControl(step.messageId),
			route: new FormControl(step.routeId),
			connection: new FormControl(step.connectionId),
			links: new FormControl(step.links),
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
			parallelProcessing: flow.parallelProcessing,
			maximumRedeliveries: flow.maximumRedeliveries,
			redeliveryDelay: flow.redeliveryDelay,
			logLevel: flow.logLevel,
			integration: flow.integrationId,
		});
	}

	updateStepData(step: IStep, stepData: FormControl): void {
		stepData.patchValue({
			id: step.id,
			componentType: step.componentType,
			stepType: step.stepType,
			uri: step.uri,
			message: step.messageId,
			route: step.routeId,
			connection: step.connectionId,
			links: new FormControl(step.links),
		});
	}

	addStep(step, index): void {

		let newIndex = index + 1;

    //keep connections or message enabled if true
    for (let i = this.numberOfSteps -1; i > index; i--) {

        let j = i + 1;

        if(this.enableConnection[i] === true){
          this.enableConnection[j] = true;
        }else{
          this.enableConnection[j] = false;
        }

        if(this.enableMessage[i] === true){
          this.enableMessage[j] = true;
        }else{
           this.enableMessage[j] = false;
        }

    }

		this.steps.splice(newIndex, 0, new Step());
    this.stepsOptions.splice(newIndex, 0, [new Option()]);
    this.componentOptions.splice(newIndex, 0, []);

		this.numberOfSteps = this.numberOfSteps + 1;

		const newStep = this.steps.find((e, i) => i === newIndex);

    if(this.activeEditor === 'flow'){
      newStep.stepType = StepType.ACTION;
      newStep.componentType = 'log';
    }else if(this.activeEditor === 'script'){
      newStep.stepType = StepType.SCRIPT;
      newStep.componentType = '';
    }else if(this.activeEditor === 'route'){
      newStep.stepType = StepType.ROUTE;
      newStep.componentType = '';
    }

		(<FormArray>this.editFlowForm.controls.stepsData).insert(
			newIndex,
			this.initializeStepData(newStep),
		);

    // Pass component type as change event so options load for the default component (e.g. log)
    this.setTypeLinks(newStep, newIndex, newStep.componentType as any);

    this.enableConnection[newIndex] = false;
    this.enableMessage[newIndex] = false;

    const optionArray: Array<string> = [];
    optionArray.splice(0, 0, '');
    this.selectedOptions.splice(newIndex, 0, optionArray);

		this.active = newIndex.toString();
	}

	removeStep(step, index): void {

    this.stepsToDelete.push(step);

		if (index === 0) {
  			return;
 		}

		this.numberOfSteps = this.numberOfSteps - 1;

    for (let i = index + 1; i <= this.numberOfSteps; i++) {

        let j = i - 1;

        if(this.enableConnection[i] === true){
          this.enableConnection[j] = true;
        }else{
          this.enableConnection[j] = false;
        }

        if(this.enableMessage[i] === true){
          this.enableMessage[j] = true;
        }else{
           this.enableMessage[j] = false;
        }

    }

		const i = this.steps.indexOf(step);
		this.steps.splice(i, 1);
		this.stepsOptions.splice(i, 1);
		this.componentOptions.splice(i, 1);
		this.selectedOptions.splice(i, 1);
		this.editFlowForm.removeControl(index);
		(<FormArray>this.editFlowForm.controls.stepsData).removeAt(i);



	}

	addConnection(step, index): void {
	     this.enableConnection[index] = true;
	}

	addMessage(step, index): void {
	     this.enableMessage[index] = true;
	}

  setComponentOptions(step: Step, componentType: string, stepFormIndex?: number): Observable<any> {
    return from(
      new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          this.getComponentOptions(componentType, step.stepType).subscribe(data => {

            const componentOptions = data.properties;
            const stepIndex = typeof stepFormIndex === 'number' ? stepFormIndex : this.steps.indexOf(step);

            this.componentOptions[stepIndex] = Object.keys(componentOptions).map(key => ({
              ...componentOptions[key],
              ...{ name: key },
            }));
            this.componentOptions[stepIndex].sort(function (a, b) {
              return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
            });

            this.cdr.detectChanges();
            this.refreshStepEditors();
            resolve();
          });
        }, 10);
      })
    );
  }

  getComponentOptions(componentType: string, stepType?: string | StepType): any {
    const type = stepType != null ? stepType.toString().toLowerCase() : undefined;
    return this.flowService.getComponentOptions(componentType, type).pipe(
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
    if(camelComponentType){

      this.setComponentOptions(step, camelComponentType, index).subscribe(data => {

          let options: Array<string> = [];

          if(step.options.includes('&')){
            // note this splits the options with a regex, because some options have & in them.
            // implement options (key-values) into a separate table to avoid this.
             const regex = /&(?=[^=&]+=)/;
             options = step.options.split(regex);
          }else{
            options.push(step.options);
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

        this.cdr.detectChanges();
        this.refreshStepEditors();

      });

    }

    this.selectedOptions.splice(index, 0, optionArray);
  }

//chatgpt
splitOptions0(query: string): string[] {
    const result: string[] = [];
    let current = "";
    let insideValue = false;

    for (let i = 0; i < query.length; i++) {
        if (query[i] === '&' && !insideValue) {
            result.push(current);
            current = "";
        } else {
            current += query[i];
            if (query[i] === '=' && (i === 0 || query[i - 1] !== '&')) {
                insideValue = true;
            } else if (query[i] === '&') {
                insideValue = false;
            }
        }
    }
    if (current) result.push(current);

    return result;
}

//chatgpt
splitOptions1(str) {
    const regex = /([^=&]+)=([^&]*)/g;
    const result = [];
    let match;

    while ((match = regex.exec(str)) !== null) {
        const key = match[1];
        const value = match[2];

        // If the key already exists, append the value with '&'
        result[key] = result[key] ? result[key] + "&" + value : value;
    }

    return result;
}

//claude
splitOptions2(queryStr) {
  const result = [];
  // Regex to match potential parameter starts
  const regex = /([^&=]+)=|^=/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(queryStr)) !== null) {
    // If this isn't the first parameter, add the previous one to the result
    if (lastIndex > 0) {
      result.push(queryStr.substring(lastIndex, match.index));
    }
    lastIndex = match.index;
  }

  // Add the last parameter
  if (lastIndex < queryStr.length) {
    result.push(queryStr.substring(lastIndex));
  }

  return result;
}

//gemini
splitOptions3(optionsString: string): string[] {
  // Handle empty or null input string gracefully
  if (!optionsString) {
    return [];
  }

  const regex = /&(?=[^=&]+=)/;

  return optionsString.split(regex);
}

//deepseek
splitOptions4(options: string): string[] {
    const segments = options.split('&');
    const result: string[] = [];
    let currentSegment: string | null = null;

    for (const segment of segments) {
        const equalsIndex = segment.indexOf('=');
        if (equalsIndex > 0) { // Check if the segment has a non-empty key
            if (currentSegment !== null) {
                result.push(currentSegment);
            }
            currentSegment = segment;
        } else if (currentSegment === null) {
          currentSegment = segment;
        } else {
          currentSegment += '&' + segment;
        }

    }

    if (currentSegment !== null) {
        result.push(currentSegment);
    }

    return result;
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

  // this filters connections not of the correct type
  filterConnections(componentType: string, index: number): void {
    const mappedType = this.connectionsList.getConnectionType(componentType);

    const filteredConnections: Connection[] = this.connections.filter(
      connection => connection.type.toLowerCase() === mappedType.toLowerCase()
    );

    this.filterConnection[index] = filteredConnections;
  }

  createOrEditMessage(step, formMessage: AbstractControl): void {

    step.messageId = formMessage.value;

   let modalRef;

    if (typeof step.messageId === 'undefined' || step.messageId === null || !step.messageId) {
      modalRef  = this.messagePopupService.open(MessageDialogComponent as Component);
    }else{
      modalRef  = this.messagePopupService.open(MessageDialogComponent as Component, step.messageId);
    }

    modalRef.then(res => {
        res.result.then(
          result => {
            this.setMessage(step, result.id, formMessage);
          },
          reason => {
            this.setMessage(step, reason.id, formMessage);
          }
        );
    },(reason)=>{
       //console.log('createHeader error: ', reason);
    });

  }

  setMessage(step, id, formMessage: AbstractControl): void {

    this.messageService
      .getAllMessages()
      .subscribe(
      res => {
        this.messages = res.body;
        this.messageCreated = this.messages.length > 0;
        step.messageId = id;
        formMessage.patchValue(id);
        step = null;
      },
      res => this.onError(res.body)
    );
  }

	createOrEditRoute(step, formRoute: AbstractControl): void {
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

	setRoute(step, id, formRoute: AbstractControl): void {
		this.routeService
			.getAllRoutes()
			.subscribe(
				(res) => {
					this.routes = res.body;
					this.routeCreated = this.routes.length > 0;
					step.routeId = id;
					formRoute.patchValue(id);
					step = null;
				},
				(res) => this.onError(res.body),
			);
	}

  createOrEditConnection(step, connectionType: string, formConnection: AbstractControl): void {

    step.connectionId = formConnection.value;

    connectionType = this.connectionsList.getConnectionType(step.componentType);

    let modalRef;

    if (typeof step.connectionId === 'undefined' || step.connectionId === null || !step.connectionId) {
        modalRef = this.connectionPopupService.open(ConnectionDialogComponent as Component, null, connectionType);
    } else {
        modalRef = this.connectionPopupService.open(ConnectionDialogComponent as Component, step.connectionId, connectionType);
    }

    modalRef.then((res) => {
       res.result.then(
              result => {
                this.setConnection(step, result.id, formConnection);
              },
              error => {
                this.setConnection(step, error.id, formConnection);
              }
          );

       }, (error)=>{
          console.log('Set connection failed');
       }
    )

  }

  setConnection(step, id, formConnection: AbstractControl): void {
    this.connectionService.getAllConnections().subscribe(
      res => {
        this.connections = res.body;
        this.connectionCreated = this.connections.length > 0;
        step.connectionId = id;
        const addedConnectionType = step.componentType;
        this.steps.forEach((step, index) => {
          if(step.componentType === addedConnectionType){
            this.filterConnections(addedConnectionType, index);
          }
        });
        formConnection.patchValue(id);
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

	private focusFirstInvalid(switchedTab = false): void {
		setTimeout(() => {
			const form = document.querySelector('form.form-fx-validate');
			if (!form) {
				return;
			}
			const invalid = Array.from(
				form.querySelectorAll<HTMLElement>(
					'input.ng-invalid, textarea.ng-invalid, select.ng-invalid, ng-select.ng-invalid, ngx-codemirror.ng-invalid'
				)
			).find(element => {
				let node: HTMLElement | null = element;
				while (node && node !== form) {
					if (node.hasAttribute('hidden')) {
						return false;
					}
					const style = getComputedStyle(node);
					if (style.display === 'none' || style.visibility === 'hidden') {
						return false;
					}
					node = node.parentElement;
				}
				return true;
			});
			if (!invalid) {
				if (!switchedTab && this.active2 !== 'STEPS') {
					this.active2 = 'STEPS';
					this.focusFirstInvalid(true);
				}
				return;
			}
			const target =
				(invalid.matches('ng-select') ? invalid.querySelector('input') : null) ??
				(invalid.matches('ngx-codemirror') ? invalid.querySelector('textarea') : null) ??
				invalid;
			const rect = target.getBoundingClientRect();
			const inView = rect.top >= 0 && rect.bottom <= window.innerHeight && rect.height > 0;
			if (!inView) {
				target.scrollIntoView({ block: 'center', behavior: 'smooth' });
			}
			target.focus();
		});
	}

	save(startAfterSave = false): any {

		this.startAfterSave = startAfterSave;
		this.formSubmitted = true;
		this.savingFlowFailed = false;
		this.savingFlowSuccess = false;
		const goToOverview = true;

		this.setDataFromForm();
		this.setOptions();
		this.setVersion();
    this.checkForm();

		if (!this.editFlowForm.valid || this.savingFlowFailed) {
			this.editFlowForm.markAllAsTouched();
			this.focusFirstInvalid();
			return;
		}

		if (this.useCanvas) {
		  this.saveDesigner();
		} else if (this.flow.id) {
		  this.updateFlow();
		} else {
		  this.createFlow();
		}

	}

  updateFlow(){
   this.steps.forEach(step => {
     step.flowId = this.flow.id;
   });

   const stepDeletes = this.stepsToDelete
     .filter(step => step.id != null)
     .map(step => this.stepService.delete(step.id));

   this.flowService
     .update(this.flow)
     .pipe(
       takeUntilDestroyed(this.destroyRef),
       switchMap(flow => {
         this.flow = flow.body;
         return stepDeletes.length ? forkJoin(stepDeletes) : of([]);
       }),
       switchMap(() => this.stepService.updateMultiple(this.steps)),
       switchMap(results => {
         this.steps = results.body.concat();
         this.updateForm();
         return this.updateLinks$();
       }),
       switchMap(() => this.stepService.findByFlowId(this.flow.id)),
     )
     .subscribe(() => this.afterSave());
  }

  createFlow(){
		this.flow.integrationId = this.integrations[0].id;

    this.flowService
      .create(this.flow)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(flowUpdated => {
          this.flow = flowUpdated.body;
          this.steps.forEach(step => {
            step.flowId = this.flow.id;
          });
          return this.stepService.createMultiple(this.steps);
        }),
        switchMap(toRes => {
          this.steps = toRes.body;
          return this.createLinks$();
        }),
      )
      .subscribe({
        next: () => {
          this.updateForm();
          this.finished = true;
          this.afterSave();
        },
        error: () => {
          this.handleErrorWhileCreatingFlow(this.flow.id, this.step.id);
        },
      });
  }

  private createLinks$(): Observable<unknown> {
    const requests: Observable<unknown>[] = [];
    let previousStepId = 0;

    this.steps.forEach(step => {
      if (step.stepType === 'ACTION' || step.stepType === 'SOURCE' || step.stepType === 'ROUTE') {
        const linkName = this.flow.id + '-' + step.id;
        requests.push(this.linkService.create(this.setLink(linkName, step.id, 'out')));
      }

      if (step.stepType === 'ACTION' || step.stepType === 'SINK' || step.stepType === 'ROUTE') {
        const linkName = this.flow.id + '-' + previousStepId;
        if (previousStepId != 0) {
          requests.push(this.linkService.create(this.setLink(linkName, step.id, 'in')));
        }
      }

      previousStepId = step.id;
    });

    return requests.length ? forkJoin(requests) : of(null);
  }

  private updateLinks$(): Observable<unknown> {
    return this.deleteLinks$().pipe(switchMap(() => this.createLinks$()));
  }

  private deleteLinks$(): Observable<unknown> {
    const requests = [
      ...this.stepsToDelete.filter(step => step.id != null).map(step => this.linkService.deleteByStepId(step.id)),
      ...this.steps.filter(step => step.id != null).map(step => this.linkService.deleteByStepId(step.id)),
    ];
    return requests.length ? forkJoin(requests) : of(null);
  }

	setDataFromForm(): void {
		const flowControls = this.editFlowForm.controls;

		flowControls.name.markAsTouched();
		flowControls.name.updateValueAndValidity();

		this.flow.id = flowControls.id.value;
		this.flow.name = flowControls.name.value;
		this.flow.logLevel = flowControls.logLevel.value;
		this.flow.notes = flowControls.notes.value;
		this.flow.autoStart = flowControls.autoStart.value;
		this.flow.integrationId = flowControls.integration.value;

		(<FormArray>flowControls.stepsData).controls.forEach(
			(step, index) => {
				this.setDataFromFormOnStep(this.steps[index],	(<FormGroup>step).controls, index);
			},
		);
	}

	setDataFromFormOnStep(step: Step, formStepData, index: number) {

		step.id = formStepData.id.value;
		step.componentType = formStepData.componentType.value;
		step.stepType = formStepData.stepType.value;
		step.uri = formStepData.uri.value;
		step.messageId = formStepData.message.value;
		step.routeId = formStepData.route.value;
		step.connectionId = formStepData.connection.value;
	}

	setLink(name: string, stepId: number, bound: string): ILink {

	    const link = new Link();
      link.name = name;
      link.bound = bound;
      link.transport = 'sync';
      link.stepId = stepId;

      return link;
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
        .testConnection(this.flow.integrationId, this.connectionHost, this.connectionPort, this.connectionTimeout)
        .subscribe(result => {
          this.testConnectionMessage = result.body;
        });
    }


	// Visual designer
	//
	// The Flow graph (in `designer`) holds the shape of the Flow: its Steps, Links, Branches and positions.
	// Each Step keeps its configuration in the Step forms; `stepKeys[i]` is the graph key of `steps[i]`.
	// Forms are never removed while editing, so undo can bring a deleted Step back with its settings;
	// only the Steps still in the graph are saved.

	designer?: FlowGraphHistory;
	canvasGraph?: FlowGraph;
	canvasProblems: Problem[] = [];
	selection: DesignerSelection = { type: 'flow' };
	stepKeys: string[] = [];
	designerNotice?: string;
	designerMessage?: string;

	@ViewChild(FlowCanvasComponent) flowCanvas?: FlowCanvasComponent;

	private designerBody?: HTMLElement;

	/** The canvas and its panel reach down to the bottom of the window. */
	@ViewChild('designerBody') set designerBodyRef(ref: ElementRef<HTMLElement> | undefined) {
		this.designerBody = ref?.nativeElement;
		this.fitDesignerToWindow();
	}

	@HostListener('window:resize')
	fitDesignerToWindow(): void {
		const body = this.designerBody;
		if (body) {
			const setHeight = (height: number) => (body.style.height = `${Math.max(Math.floor(height), DESIGNER_MIN_HEIGHT)}px`);
			const top = body.getBoundingClientRect().top + window.scrollY;
			setHeight(window.innerHeight - top);
			// The page's own padding below the designer would still make the window scroll; take that off too.
			setHeight(window.innerHeight - top - (document.documentElement.scrollHeight - window.innerHeight));
		}
	}

	/** Script and Route Flows keep the form editor; every other Flow is designed on the canvas. */
	get useCanvas(): boolean {
		return opensOnCanvas(this.activeEditor);
	}

	/** The kind of the selected Router, shown read-only as its component. */
	get selectedRouterKind(): string | undefined {
		const selection = this.selection;
		const router = selection.type === 'step' ? this.canvasGraph?.steps.find(s => s.key === selection.key && s.kind === 'ROUTER') : undefined;
		return router ? routerKind(router) : undefined;
	}

	get selectedStepDeletable(): boolean {
		const selection = this.selection;
		return selection.type === 'step' && !!this.designer && !this.designer.current.readOnlyReason && canDeleteStep(this.designer.current, selection.key);
	}

	get selectedStepIndex(): number {
		return this.selection.type === 'step' ? this.stepKeys.indexOf(this.selection.key) : -1;
	}

	get errorStepIndex(): number {
		return this.stepKeys.indexOf(ERROR_STEP_KEY);
	}

	get selectedLink(): DesignLink | undefined {
		const selection = this.selection;
		return selection.type === 'link' ? this.canvasGraph?.links.find(l => l.to === selection.to) : undefined;
	}

	get selectedLinkProblem(): string | undefined {
		const selection = this.selection;
		return selection.type === 'link' ? this.canvasProblems.find(p => p.linkTo === selection.to)?.message : undefined;
	}

	get flowIsDraft(): boolean {
		return this.canvasProblems.length > 0;
	}

	private loadDesigner(flow: IFlow): void {
		const graph = loadFlowGraph(flow);

		this.steps = [];
		this.stepKeys = [];
		this.numberOfSteps = 0;
		(<FormArray>this.editFlowForm.controls.stepsData).clear();

		graph.steps.forEach(designStep => {
			const saved = (flow.steps ?? []).find(step => step.id != null && step.id === designStep.id);
			if (saved) {
				this.addSavedStepForm(saved, designStep.key);
			} else {
				this.addNewStepForm(designStep.kind as StepType, this.defaultComponentType(designStep.kind, designStep.componentType), designStep.key);
			}
		});

		if (graph.errorStep) {
			this.addSavedStepForm(graph.errorStep, ERROR_STEP_KEY);
		} else {
			this.addNewStepForm(StepType.ERROR, this.defaultComponentType('ERROR'), ERROR_STEP_KEY);
		}

		this.designer = new FlowGraphHistory(graph);
		this.selection = { type: 'flow' };
		this.designerNotice =
			graph.readOnlyReason ??
			(graph.repaired ? 'The Links of this Flow were incomplete. They are shown as a chain and will be saved that way.' : undefined);
		this.refreshCanvas();

		this.editFlowForm.controls.stepsData.valueChanges
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(() => this.refreshCanvas());
	}

	private addSavedStepForm(step: IStep, key: string): void {
		const index = this.steps.length;
		this.stepKeys.push(key);
		this.numberOfSteps = this.numberOfSteps + 1;

		if (typeof this.stepsOptions[index] === 'undefined') {
			this.stepsOptions.push([]);
		}
		this.steps.push(step);
		(<FormArray>this.editFlowForm.controls.stepsData).insert(index, this.initializeStepData(step));
		this.setTypeLinks(step, index);
		this.getOptions(step, this.editFlowForm.controls.stepsData.get(index.toString()), this.stepsOptions[index], index);
		this.enableConnection[index] = !!step.connectionId;
		this.enableMessage[index] = !!step.messageId;
	}

	private addNewStepForm(stepType: StepType, componentType: string, key: string): void {
		this.stepKeys.push(key);
		this.createNewStep(stepType, componentType, this.steps.length);
	}

	private defaultComponentType(kind: string, componentType?: string): string {
		const integration = this.integrations?.[this.indexIntegration ?? 0] ?? this.integrations?.[0];
		switch (kind) {
			case 'SOURCE':
				return componentType || integration?.defaultFromComponentType || '';
			case 'SINK':
				return componentType || integration?.defaultToComponentType || '';
			case 'ERROR':
				return componentType || integration?.defaultErrorComponentType || '';
			default:
				return componentType || 'log';
		}
	}

	/** The Flow graph with each Step's component and settings taken from its form. */
	private syncedGraph(): FlowGraph {
		const graph = this.designer!.current;
		const stepsData = this.editFlowForm.controls.stepsData as FormArray;
		return {
			...graph,
			steps: graph.steps.map(step => {
				const index = this.stepKeys.indexOf(step.key);
				const form = (stepsData.at(index) as FormGroup)?.getRawValue();
				return form
					? {
							...step,
							componentType: form.componentType || undefined,
							uri: form.uri || undefined,
							options: this.steps[index]?.options,
							connectionId: form.connection || undefined,
							messageId: form.message || undefined,
							routeId: form.route || undefined,
						}
					: step;
			}),
		};
	}

	private refreshCanvas(): void {
		if (!this.designer) {
			return;
		}
		this.canvasGraph = this.syncedGraph();
		this.canvasProblems = problems(this.canvasGraph);
		this.cdr.markForCheck();
	}

	/** Applies an edit of the Flow graph; a rejected edit is explained to the user and changes nothing. */
	private edit(result: EditResult): void {
		if (!this.designer || this.designer.current.readOnlyReason) {
			return;
		}
		this.designer.apply(result);
		this.designerMessage = result.outcome === 'rejected' ? result.reason : undefined;
		this.addFormsForNewSteps();
		this.refreshCanvas();
	}

	private addFormsForNewSteps(): void {
		this.designer!.current.steps
			.filter(step => !this.stepKeys.includes(step.key))
			.forEach(step => this.addNewStepForm(step.kind as StepType, this.defaultComponentType(step.kind, step.componentType), step.key));
	}

	/** Whether the side panel is hidden, to give the canvas the whole width. Hidden by default; remembered in this browser. */
	sidePanelCollapsed = readPanelCollapsed();

	togglePanel(): void {
		this.setPanelCollapsed(!this.sidePanelCollapsed);
	}

	/** A double-click on a Step shows it in the side panel when the panel is hidden, and hides the panel when it is shown. */
	toggleStepEditor(key: string): void {
		this.onSelectionChange({ type: 'step', key });
		this.setPanelCollapsed(!this.sidePanelCollapsed);
	}

	openFlowSettings(): void {
		this.onSelectionChange({ type: 'flow' });
		this.setPanelCollapsed(false);
	}

	private setPanelCollapsed(collapsed: boolean): void {
		this.sidePanelCollapsed = collapsed;
		try {
			localStorage.setItem(PANEL_COLLAPSED_KEY, String(collapsed));
		} catch {
			// Without storage the panel is simply hidden again next time.
		}
	}

	onSelectionChange(selection: DesignerSelection): void {
		this.selection = selection;
		this.cdr.markForCheck();
	}

	onInsertStep(event: { linkTo: string; kind: 'ACTION' | 'ROUTER'; componentType: string }): void {
		const before = new Set(this.designer!.current.steps.map(s => s.key));
		this.edit(insertStep(this.designer!.current, event.linkTo, event.kind, event.componentType));
		const inserted = this.designer!.current.steps.find(s => !before.has(s.key) && s.kind === event.kind);
		if (inserted) {
			this.selection = { type: 'step', key: inserted.key };
			this.flowCanvas?.reveal(inserted.key);
		}
	}

	onAppendStep(event: { after: string; kind: 'ACTION' | 'ROUTER' | 'SINK'; componentType: string }): void {
		const before = new Set(this.designer!.current.steps.map(s => s.key));
		this.edit(appendStep(this.designer!.current, event.after, event.kind, event.componentType));
		const appended = this.designer!.current.steps.find(s => !before.has(s.key) && s.kind === event.kind);
		if (appended) {
			this.selection = { type: 'step', key: appended.key };
			this.flowCanvas?.reveal(appended.key);
		}
	}

	onAddBranch(routerKey: string): void {
		this.edit(addBranch(this.designer!.current, routerKey));
	}

	onDeleteStep(key: string): void {
		const graph = this.designer!.current;
		const step = graph.steps.find(s => s.key === key);
		const branches = graph.links.filter(l => l.from === key).length;
		if (
			step?.kind === 'ROUTER' &&
			branches > 1 &&
			!window.confirm(`Delete this ${routerKind(step)} Router? Its Default branch takes its place and its other Branches are deleted.`)
		) {
			return;
		}
		this.edit(deleteStep(graph, key));
		if (!this.designer!.current.steps.some(s => s.key === key)) {
			this.selection = { type: 'flow' };
		}
	}

	onDeleteBranch(linkTo: string): void {
		this.edit(deleteBranch(this.designer!.current, linkTo));
		if (!this.designer!.current.links.some(l => l.to === linkTo)) {
			this.selection = { type: 'flow' };
		}
	}

	onMoveStep(event: { key: string; x: number; y: number }): void {
		this.edit(moveStep(this.designer!.current, event.key, event.x, event.y));
	}

	onLinkChange(settings: Partial<LinkSettings>): void {
		const selection = this.selection;
		if (selection.type === 'link') {
			this.edit(updateLink(this.designer!.current, selection.to, settings));
		}
	}

	autoArrangeCanvas(): void {
		this.edit({ outcome: 'accepted', graph: autoArrange(this.designer!.current) });
	}

	undo(): void {
		this.designer?.undo();
		this.refreshCanvas();
	}

	redo(): void {
		this.designer?.redo();
		this.addFormsForNewSteps();
		this.refreshCanvas();
	}

	@HostListener('document:keydown', ['$event'])
	onDesignerKeydown(event: KeyboardEvent): void {
		const target = event.target as HTMLElement;
		if (!this.designer || target.closest('input, textarea, select, [contenteditable], .CodeMirror')) {
			return;
		}
		// Space adds a Step, like the + that fits the selection. On a focused button or link, Space keeps its usual meaning.
		if (event.key === ' ' && !event.ctrlKey && !event.metaKey && !event.altKey && !target.closest('button, a')) {
			if (this.flowCanvas?.openStepPicker(this.selection)) {
				event.preventDefault();
			}
			return;
		}
		if (event.key === 'Delete' && !event.ctrlKey && !event.metaKey) {
			const selection = this.selection;
			if (selection.type === 'step') {
				this.onDeleteStep(selection.key);
			} else if (selection.type === 'link') {
				this.onDeleteBranch(selection.to);
			}
			return;
		}
		if (!(event.ctrlKey || event.metaKey)) {
			return;
		}
		if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
			event.preventDefault();
			this.undo();
		} else if (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey)) {
			event.preventDefault();
			this.redo();
		}
	}

	/** True while the Flow has edits that are not saved; used to warn before leaving the designer. */
	get hasUnsavedChanges(): boolean {
		return !!this.designer?.hasUnsavedChanges || !!this.editFlowForm?.dirty;
	}

	/**
	 * Stays in the editor after a save: the URL gets the Flow's id (a new Flow only has one now), and the Flow is
	 * loaded again so every Step has its saved id. Save & start then starts it; a failed start shows as Error.
	 */
	private afterSave(): void {
		this.savingFlowSuccess = true;
		this.isSaving = false;
		this.editFlowForm.markAsPristine();
		const url = this.router.createUrlTree(['/flow/editor', this.flow.id], {
			queryParams: { mode: 'edit', editor: this.activeEditor, id: this.flow.id },
		});
		this.location.replaceState(this.router.serializeUrl(url));
		this.load(this.flow.id);
		if (this.startAfterSave) {
			this.startAfterSave = false;
			this.header?.start(this.flow.id);
		}
	}

	get nameControl(): FormControl<string> {
		return this.editFlowForm.controls.name as FormControl<string>;
	}

	/** Why the Flow is a Draft, or null. Only a Visual Flow can be a Draft. */
	get draftReason(): string | null {
		return this.useCanvas && this.canvasProblems.length > 0 ? this.canvasProblems[0].message : null;
	}

	get sourceComponent(): string | undefined {
		return this.steps?.find(step => step.stepType === StepType.SOURCE)?.componentType;
	}

	@HostListener('window:beforeunload', ['$event'])
	onBeforeUnload(event: BeforeUnloadEvent): void {
		if (this.hasUnsavedChanges) {
			event.preventDefault();
		}
	}

	/**
	 * Saves the whole Flow: the Flow itself, then the Steps still in the graph, then all Links again
	 * (named after the Step they lead to), and finally deletes the Steps that were removed.
	 */
	private saveDesigner(): void {
		const graph = this.syncedGraph();
		if (graph.readOnlyReason) {
			this.savingFlowFailedMessage = graph.readOnlyReason;
			this.savingFlowFailed = true;
			return;
		}

		const keys = [...graph.steps.map(s => s.key), ERROR_STEP_KEY];
		const stepsInGraph = keys.map(key => this.steps[this.stepKeys.indexOf(key)]);
		const removedSteps = this.steps.filter((step, i) => step.id != null && !keys.includes(this.stepKeys[i]));

		stepsToSave(graph, this.flow.id ?? 0).forEach(({ key, step }) => {
			const target = this.steps[this.stepKeys.indexOf(key)];
			target.options = step.options;
			target.coordinateX = step.coordinateX;
			target.coordinateY = step.coordinateY;
		});

		// A Draft can't run, so it is never started automatically; the setting can be switched on again once it is complete.
		if (isDraft(graph)) {
			this.flow.autoStart = false;
		}

		this.isSaving = true;
		const flowSaved$ = this.flow.id ? this.flowService.update(this.flow) : this.flowService.create(this.flow);

		flowSaved$
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap(flow => {
					this.flow = flow.body;
					stepsInGraph.forEach(step => (step.flowId = this.flow.id));
					return this.stepService.updateMultiple(stepsInGraph);
				}),
				switchMap(saved => {
					const stepIds = new Map<string, number>(keys.map((key, i) => [key, saved.body[i].id]));
					const linkDeletes = [...saved.body, ...removedSteps].map(step => this.linkService.deleteByStepId(step.id));
					return forkJoin(linkDeletes).pipe(map(() => stepIds));
				}),
				switchMap(stepIds => {
					const stepDeletes = removedSteps.map(step => this.stepService.delete(step.id));
					return (stepDeletes.length ? forkJoin(stepDeletes) : of([])).pipe(map(() => stepIds));
				}),
				switchMap(stepIds => {
					const links = linksToSave(graph, this.flow.id, stepIds).map(link => this.linkService.create(link));
					return links.length ? forkJoin(links) : of([]);
				}),
			)
			.subscribe({
				next: () => {
					this.designer!.markSaved();
					this.afterSave();
				},
				error: () => {
					this.savingFlowFailed = true;
					this.isSaving = false;
				},
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

/** The graph key of a Flow's Error Step, which lives in the Flow settings rather than on the canvas. */
const ERROR_STEP_KEY = 'error';

const PANEL_COLLAPSED_KEY = 'flow-designer.panel-collapsed';

function readPanelCollapsed(): boolean {
	try {
		return localStorage.getItem(PANEL_COLLAPSED_KEY) !== 'false';
	} catch {
		return true;
	}
}

/** The height in pixels the designer never shrinks below, however small the window. */
const DESIGNER_MIN_HEIGHT = 400;

export class Option {
  constructor(public key?: string, public value?: string) {}
}
