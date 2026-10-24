import { ChangeDetectorRef, Component, DestroyRef, ElementRef, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation, inject } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { NgbModal, NgbModalRef, NgbModule, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
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
import { IRoute, Route } from "app/shared/model/route.model";
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
import { FlowService, IFlowCounts } from "../flow.service";
import { FieldTabDirective } from "app/shared/form/field-tab.directive";
import { SaveShortcutDirective, isTypingTarget } from "app/shared/keyboard";
import { CodemirrorModule } from "@ctrl/ngx-codemirror";
import { ThemeService } from "app/core/theme";
import { FlowCanvasComponent, DesignerSelection } from "../designer/flow-canvas.component";
import { EditorMode, FlowEditorHeaderComponent } from "./flow-editor-header.component";
import { FlowFailure, failureProblems, firstRouteStepOf, routeSourceOf, sourceStepOf } from "../flow-status";
import { FlowTestPanelComponent } from "../test/flow-test-panel.component";
import { FlowRunStatsComponent } from "../stats/flow-run-stats.component";
import { FlowLogDrawerComponent } from "../flow-log-drawer.component";
import { CamelRouteDrawerComponent } from "../camel-route-drawer.component";
import { FlowTestRun, StepRun, StepRunMark, graphShape, runResultsByStepKey, shortDuration, stepRunsById } from "../test/flow-test-run";
import { automaticErrorHandlerPath, defaultErrorHandlerStep, errorHandlerPath, errorHandlerPathOnSave } from "./error-handler";
import { isRouteConfiguration, isRouteStep, missingRouteFields, nextRouteName, routeToSave } from "./route-step";
import { CdkDrag, CdkDragPlaceholder, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  DEFAULT_RESULT_LOG,
  DEFAULT_SCRIPT_LANGUAGE,
  SCRIPT_LANGUAGES,
  SCRIPT_STARTER_SOURCE,
  ScriptFlowSummary,
  defaultResultLogStep,
  nextSchedulerName,
  scriptEditorMode,
  scriptFlowSummary,
  scriptLanguageLabel,
  starterScript,
} from "./script-flow";
import { ComponentSchemas } from "../component-schemas.service";
import { FlowTemplate, flowTemplate, templateFlow } from "../templates/flow-templates";
import { STARTER_FLOW, STARTER_ROUTE } from "../templates/starter-flow";
import { VariableKeysService } from "app/entities/environment-variables/variable-keys.service";
import { variableWarnings } from "app/shared/camel/variables";
import { LinkEditorComponent } from "../designer/link-editor.component";
import { ResponseEditorComponent } from "./response-editor.component";
import { CallFlowEditorComponent, callableFlows } from "./call-flow-editor.component";
import { ApiService } from "app/entities/api/api.service";
import { operationUrl } from "app/entities/api/operation-url";
import { IApiHandler } from "app/entities/api/api.model";
import { FlowGraphHistory } from "../designer/flow-graph-history";
import {
  addBranch,
  appendStep,
  autoArrange,
  canDeleteStep,
  COMPONENTS_WITH_CONNECTION,
  deleteBranch,
  deleteStep,
  DesignLink,
  EditResult,
  FlowGraph,
  insertStep,
  isDraft,
  isResponse,
  LinkSettings,
  linksToSave,
  loadFlowGraph,
  moveSteps,
  opensOnCanvas,
  Problem,
  problems,
  routerTitle,
  StepMove,
  stepsToSave,
  updateLink,
  warnings,
} from "../designer/flow-graph";

@Component({
  selector: 'jhi-flow-editor-esb',
  templateUrl: './flow-editor-esb.component.html',
  styleUrl: '../designer/flow-designer.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [StepEditorRegistry],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgbModule, FontAwesomeModule, PopoverModule, AlertError, FlowEditorStepComponent, FieldTabDirective, SaveShortcutDirective, CodemirrorModule, FlowCanvasComponent, LinkEditorComponent, FlowEditorHeaderComponent, ResponseEditorComponent, CallFlowEditorComponent, FlowTestPanelComponent, FlowRunStatsComponent, FlowLogDrawerComponent, CamelRouteDrawerComponent, CdkDropList, CdkDrag, CdkDragPlaceholder],
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
	/** Set by Save & start or Save & restart: start or restart the Flow once it is saved. */
	/** What happens once the Flow is saved: stay in the editor, start the Flow, or go back to Manage. */
	private afterSaveAction: AfterSave = 'stay';
	/** The Flow's name as it was last saved, which a default Error Handler path follows. */
	private savedFlowName?: string | null;
	private readonly location = inject(Location);
	private readonly schemas = inject(ComponentSchemas);
	private readonly variableKeys = inject(VariableKeysService);
	/** The keys of the Variables, to warn about Steps that refer to one that doesn't exist; null until loaded. */
	private knownVariables: string[] | null = null;
	/** The Example Flow a new Flow starts from, from the `template` query parameter. */
	private template?: FlowTemplate;
	private readonly apiService = inject(ApiService);
	private readonly offcanvas = inject(NgbOffcanvas);

	/** The API and Operation this Flow handles, when it is a Handler Flow: its Source is that Operation. */
	handler?: IApiHandler;
	/** The full URL a Handler Flow's Operation is served on; the Operation links to it. */
	operationUrl?: string;
	/** The Flows a Call Flow Step can call: those with a flowlink Source. */
	callableFlows: IFlow[] = [];
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
  public languageComponentsNames = SCRIPT_LANGUAGES;
  public componentsWithConnection: readonly string[] = COMPONENTS_WITH_CONNECTION;

	panelCollapsed: any = "uno";
	public isCollapsed = true;
	active: string;
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

		this.variableKeys
			.keys()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(keys => {
				this.knownVariables = keys;
				this.checkCanvas();
			});

		this.isSaving = false;
		this.createRoute = 0;

		this.setPopoverMessages();

		this.setComponents();

		this.subscription =
			this.route.queryParams.subscribe(
				(params) => {
					const nextEditor = params["editor"];
					const nextTemplate = params["id"] ? undefined : flowTemplate(params["template"]);
					const editorChanged =
						!params["id"] && !!this.activeEditor && (this.activeEditor !== nextEditor || this.template?.id !== nextTemplate?.id);

					this.activeStep = params["stepid"];
					this.activeEditor = nextEditor;
					this.applyMode(params["id"] && hasModes(nextEditor) && params["view"] === "test" ? "test" : "design");
					this.template = nextTemplate;

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
		this.resetSteps();
	}

	/**
	 * Forgets the Steps and what is kept per Step, before they are (re)loaded into a new form: after a save the Flow is
	 * loaded again, and Options left from before would no longer match the rows of the new form.
	 */
	private resetSteps(): void {
		this.steps = [];
		this.stepsOptions = [[]];
		this.componentOptions = [];
		this.selectedOptions = [[]];
		this.numberOfSteps = 0;
		this.errorStep = true;
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
						forkJoin([this.flowService.find(id), this.apiService.handlerOf(Number(id)), this.flowService.query({ page: 0, size: 1000 })])
							.subscribe(
								([flow, handler, flows]) => {
									this.flow = flow.body;
									// A clone is an ordinary Flow: its Source becomes a placeholder (see clone()).
									this.handler = isCloning ? undefined : handler;
									this.clonedHandler = isCloning ? handler : undefined;
									this.loadOperationUrl();
									this.callableFlows = callableFlows(flows.body ?? [], this.flow.id);
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

								// every new Flow starts from the starter Source, or from the Example Flow it was made from
                if(this.useCanvas){
                    this.loadDesigner(this.flow, this.template ?? STARTER_FLOW);
                    if (this.template && !this.nameControl.value) {
                        this.nameControl.setValue(this.template.title);
                    }
                }else if(this.activeEditor === 'script'){
                    this.createNewStep(StepType.SOURCE,SCRIPT_STARTER_SOURCE.componentType,0);
                    this.createNewStep(StepType.SCRIPT,DEFAULT_SCRIPT_LANGUAGE,1);
                    this.addStepForm(defaultResultLogStep());
                    this.addStepForm(defaultErrorHandlerStep());
                    this.applyScriptFlowDefaults();
                }else if(this.activeEditor === 'route'){
                    this.createNewStep(StepType.ROUTE,'',0);
                    this.createNewStep(StepType.ERROR,'',1);
                    this.stepFormAt(0).patchValue({ routeName: nextRouteName([]), routeContent: STARTER_ROUTE });
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

      this.resetSteps();

      if(this.flow.steps.length > 0){

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

        this.enableConnection[index] = this.showsConnection(step);

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

  /**
   * A new Script Flow runs as created: its once Source sends the script a body when the Flow starts, and its Script
   * Step starts with an example. Runs after the Steps are created, as creating a Step clears these fields.
   */
  private applyScriptFlowDefaults(): void {
    const source = this.steps[0];
    source.uri = SCRIPT_STARTER_SOURCE.uri;
    this.stepFormAt(0).patchValue({ uri: source.uri });
    this.fillOptions(0, SCRIPT_STARTER_SOURCE.options);

    this.stepFormAt(1).patchValue({ uri: starterScript(DEFAULT_SCRIPT_LANGUAGE) });
  }

  /** Gives a new Step these options (`key=value&key=value`), in the Step, its form rows and the rows the Step editor shows. */
  private fillOptions(index: number, options: string): void {
    const pairs = options.split('&').map(pair => pair.split('='));
    const formOptions = <FormArray>this.stepFormAt(index).controls.options;
    while (formOptions.length < pairs.length) {
      formOptions.push(this.initializeOption());
    }
    // The Step editor holds this array, so it is refilled rather than replaced.
    const stepOptions = this.stepsOptions[index];
    stepOptions.length = 0;
    pairs.forEach(([key, value], i) => {
      formOptions.at(i).patchValue({ key, value });
      stepOptions.push(new Option(key, value));
    });
    this.selectedOptions[index] = pairs.map(([key]) => key);
    this.steps[index].options = options;
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
          // a newly chosen Component takes the one Connection there is for it, such as the Gateway broker for JMS
          const [onlyConnection, ...others] = this.filterConnection[stepFormIndex];
          if (typeof e !== 'undefined' && onlyConnection && others.length === 0) {
            step.connectionId = onlyConnection.id;
            stepForm?.controls.connection.patchValue(onlyConnection.id);
          }
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
		// A clone of a Handler Flow doesn't claim its Operation: its Source is a placeholder, so the clone is a Draft.
		if (this.clonedHandler) {
			const sourceIndex = this.steps.findIndex(step => step.stepType === StepType.SOURCE);
			if (sourceIndex >= 0) {
				const source = this.steps[sourceIndex];
				source.componentType = '';
				source.uri = '';
				source.options = '';
				this.stepFormAt(sourceIndex).patchValue({ componentType: '', uri: '' });
			}
			this.clonedHandler = undefined;
		}

		// The copy of a Script Flow gets its own scheduler.
		if (this.activeEditor === 'script') {
			const sourceIndex = this.steps.findIndex(step => step.stepType === StepType.SOURCE && step.componentType === 'scheduler');
			if (sourceIndex >= 0) {
				this.steps[sourceIndex].uri = nextSchedulerName(this.allsteps);
				this.stepFormAt(sourceIndex).patchValue({ uri: this.steps[sourceIndex].uri });
			}
		}

		// The copy logs to its own name and id once it is saved.
		this.steps
			.filter(step => this.followsFlowWhenLogging(step) && step.uri && step.uri === errorHandlerPath(this.flow.name, this.flow.id))
			.forEach(step => (step.uri = ''));

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
			routeName: new FormControl(this.routeOf(step.routeId)?.name ?? ''),
			routeContent: new FormControl(this.routeOf(step.routeId)?.content ?? ''),
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
			routeName: this.routeOf(step.routeId)?.name ?? '',
			routeContent: this.routeOf(step.routeId)?.content ?? '',
			connection: step.connectionId,
			links: new FormControl(step.links),
		});
	}

	addStep(step, index, stepType?: StepType): void {

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
    }else if(this.activeEditor === 'script' && stepType === StepType.SINK){
      newStep.stepType = StepType.SINK;
      newStep.componentType = DEFAULT_RESULT_LOG.componentType;
    }else if(this.activeEditor === 'script'){
      newStep.stepType = StepType.SCRIPT;
      newStep.componentType = DEFAULT_SCRIPT_LANGUAGE;
    }else if(this.activeEditor === 'route'){
      newStep.stepType = StepType.ROUTE;
      newStep.componentType = '';
    }

		// Named before it joins the form, so it takes the first name the other Routes don't use.
		const routeName = newStep.stepType === StepType.ROUTE ? nextRouteName(this.typedRouteNames()) : '';

		(<FormArray>this.editFlowForm.controls.stepsData).insert(
			newIndex,
			this.initializeStepData(newStep),
		);
		if (routeName) {
			this.stepFormAt(newIndex).patchValue({ routeName });
		}

    // Pass component type as change event so options load for the default component (e.g. log)
    this.setTypeLinks(newStep, newIndex, newStep.componentType as any);

    if (newStep.stepType === StepType.SCRIPT) {
      this.stepFormAt(newIndex).patchValue({ uri: starterScript(newStep.componentType) });
    }

    this.enableConnection[newIndex] = false;
    this.enableMessage[newIndex] = false;

    const optionArray: Array<string> = [];
    optionArray.splice(0, 0, '');
    this.selectedOptions.splice(newIndex, 0, optionArray);

    if (newStep.stepType === StepType.SINK && this.activeEditor === 'script') {
      newStep.uri = '';
      this.fillOptions(newIndex, DEFAULT_RESULT_LOG.options);
    }

		this.active = newIndex.toString();
	}

	// Script editor
	//
	// Code edits the Scripts, the Source and where the result goes, the Error handler and the Notes, each on a tab. Test
	// shows the Scripts read-only, each with what it made of the test message, beside the Test panel and the stats.

	scriptTab: ScriptTab = 'scripts';

	readonly scriptTabs = [
		{ id: 'scripts', label: 'Scripts', icon: 'code' },
		{ id: 'source', label: 'Source & result', icon: 'sign-in-alt' },
		{ id: 'errorHandler', label: 'Error handler', icon: 'exclamation-triangle' },
		{ id: 'notes', label: 'Notes', icon: 'file-alt' },
	] as const;

	showScriptTab(tab: ScriptTab): void {
		this.scriptTab = tab;
		this.scrollCodeToTop();
		this.cdr.markForCheck();
	}

	/** The indices of the Scripts of a Script Flow, in their order. */
	get scriptIndices(): number[] {
		return this.steps.flatMap((step, index) => (step.stepType === StepType.SCRIPT ? [index] : []));
	}

	get scriptCount(): number {
		return this.scriptIndices.length;
	}

	/** The Steps on the Source & result tab: the Source and, when the Flow has one, the Sink. */
	get scriptEndIndices(): number[] {
		return this.steps.flatMap((step, index) => (step.stepType === StepType.SOURCE || step.stepType === StepType.SINK ? [index] : []));
	}

	get hasResultStep(): boolean {
		return this.steps.some(step => step.stepType === StepType.SINK);
	}

	/** Where a new Script or the Log of the result goes after: the last Script, or the Source of a Flow without Scripts. */
	private get lastScriptIndex(): number {
		const last = this.steps.map(step => step.stepType).lastIndexOf(StepType.SCRIPT);
		return last >= 0 ? last : this.steps.findIndex(step => step.stepType === StepType.SOURCE);
	}

	/** The Steps the Scripts tab sums up, as the user has them in the form. */
	get scriptSummary(): ScriptFlowSummary {
		return scriptFlowSummary(
			this.steps.map((step, index) => {
				const form = this.stepFormAt(index)?.getRawValue();
				const options = ((form?.options ?? []) as { key?: string; value?: string }[])
					.filter(option => option.key && option.value)
					.map(option => `${option.key}=${option.value}`)
					.join('&');
				return { stepType: step.stepType, componentType: form?.componentType, uri: form?.uri, options };
			}),
		);
	}

	/** Whether a Step the Scripts tab sums up needs the user's attention after a save attempt. */
	summaryItemInvalid(index: number | undefined): boolean {
		return this.formSubmitted && index !== undefined && !!this.stepFormAt(index)?.invalid;
	}

	/** Shows the tab of a Step the Scripts tab sums up, with the Step in view. */
	showSummaryStep(index: number): void {
		this.showScriptTab(this.steps[index]?.stepType === StepType.ERROR ? 'errorHandler' : 'source');
		this.cdr.detectChanges();
		document.getElementById(`step-card-${index}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
	}

	/** Adds a Script after the last one, before the Sink, and puts its code in view. */
	addScript(): void {
		const last = this.lastScriptIndex;
		this.addStep(this.steps[last], last);
		this.cdr.detectChanges();
		const card = document.getElementById(`step-card-${last + 1}`);
		card?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		// The code editor of the new Script is made after the view is.
		setTimeout(() => card?.querySelector<HTMLElement & { CodeMirror?: { focus: () => void } }>('.CodeMirror')?.CodeMirror?.focus());
	}

	/** Adds a Log Step after the last Script for the result, from the Source & result tab. */
	addResultLog(): void {
		const index = this.lastScriptIndex;
		if (index >= 0) {
			this.addStep(this.steps[index], index, StepType.SINK);
			this.cdr.markForCheck();
		}
	}

	/** The saved id of the Step a test message goes into: the first Script, past the Source; or the Sink of a Flow without Scripts. */
	get scriptEntryStepId(): string | undefined {
		const entry = this.steps.find(step => step.stepType === StepType.SCRIPT) ?? this.steps.find(step => step.stepType === StepType.SINK);
		return entry?.id != null ? String(entry.id) : undefined;
	}

	/** What the Script at this index did with the last test message; undefined when it didn't run or there is no run. */
	scriptRun(index: number): StepRun | undefined {
		const id = this.steps[index]?.id;
		return id != null ? this.stepRuns?.get(String(id)) : undefined;
	}

	/** Whether the last test message never got to the Script at this index. */
	scriptUnreached(index: number): boolean {
		return !!this.stepRuns && !this.scriptRun(index);
	}

	/** The language the Script at this index is written in, by its name. */
	scriptLanguage(index: number): string {
		return scriptLanguageLabel(this.stepFormAt(index)?.value.componentType);
	}

	readonly duration = shortDuration;

	/** The read-only editor options of a Script in Test, in its language and the editor's theme. */
	readOnlyScriptOptions(language: string | null | undefined): Record<string, unknown> {
		const theme = this.themeService.editorTheme();
		const key = `${language}|${theme}`;
		let options = this.readOnlyScriptOptionsCache.get(key);
		if (!options) {
			options = { mode: scriptEditorMode(language), theme, lineNumbers: true, lineWrapping: true, readOnly: true, viewportMargin: Infinity };
			this.readOnlyScriptOptionsCache.set(key, options);
		}
		return options;
	}

	private readonly readOnlyScriptOptionsCache = new Map<string, Record<string, unknown>>();

	removeStep(step, index): void {

		// The first Step stays, except a Route while the Flow has other Routes.
		if (index === 0 && !(step.stepType === StepType.ROUTE && this.routeCount > 1)) {
			return;
		}

    this.stepsToDelete.push(step);

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
		[this.uriPlaceholders, this.uriPopoverMessages, this.URIList, this.componentTypeCamelLinks, this.filterConnection, this.connectionType]
			.forEach(perStep => perStep.splice(i, 1));
		this.editFlowForm.removeControl(index);
		(<FormArray>this.editFlowForm.controls.stepsData).removeAt(i);
		this.editFlowForm.markAsDirty();
	}

	/** The indices of the Routes of a Route Flow, in their order; the Error handler comes after them. */
	get routeIndices(): number[] {
		return this.steps.flatMap((step, index) => (step.stepType === StepType.ROUTE ? [index] : []));
	}

	get routeCount(): number {
		return this.routeIndices.length;
	}

	/** In the lists of the Route and Script editors, a Route or Script can be moved and removed while the Flow has another. */
	isMovableListStep(index: number): boolean {
		const stepType = this.steps[index]?.stepType;
		return (stepType === StepType.ROUTE && this.routeCount > 1) || (stepType === StepType.SCRIPT && this.scriptCount > 1);
	}

	/** The names typed in the Routes, read from the form, which also has a Route that is being added. */
	private typedRouteNames(): string[] {
		const stepsData = this.editFlowForm.controls.stepsData as FormArray;
		return stepsData.controls.filter(form => form.value.stepType === StepType.ROUTE).map(form => form.value.routeName);
	}

	/** Adds a Route after the last one, before the Error handler, and puts its name in view. */
	addRoute(): void {
		const indices = this.routeIndices;
		const last = indices.length ? indices[indices.length - 1] : -1;
		this.addStep(this.steps[last], last);
		const added = last + 1;
		this.cdr.detectChanges();
		const name = document.getElementById(`field_routeName_${added}`) as HTMLInputElement | null;
		name?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		name?.focus({ preventScroll: true });
	}

	/** Moves the Route at one place in the list to another. */
	moveRoute(from: number, to: number): void {
		this.moveListedStep(this.routeIndices, from, to);
	}

	/** Moves the Script at one place in the list to another. */
	moveScript(from: number, to: number): void {
		this.moveListedStep(this.scriptIndices, from, to);
	}

	/**
	 * Moves the Step at one place in a list of the Route or Script editor, which has the Steps at these indices, to
	 * another. Each Step's per-index state moves along with it; the order is saved as the links between the Steps,
	 * which follow `steps`.
	 */
	private moveListedStep(indices: number[], from: number, to: number): void {
		if (from === to || from < 0 || to < 0 || from >= indices.length || to >= indices.length) {
			return;
		}
		const fromIndex = indices[from];
		const toIndex = indices[to];
		[
			this.steps,
			this.stepsOptions,
			this.componentOptions,
			this.selectedOptions,
			this.enableConnection,
			this.enableMessage,
			this.filterConnection,
			this.connectionType,
			this.uriPlaceholders,
			this.uriPopoverMessages,
			this.URIList,
			this.componentTypeCamelLinks,
		].forEach(perStep => {
			// A sparse array is filled up first, so every Step keeps its own entry.
			while (perStep.length <= Math.max(fromIndex, toIndex)) {
				perStep.push(undefined);
			}
			moveItemInArray(perStep, fromIndex, toIndex);
		});
		const stepsData = this.editFlowForm.controls.stepsData as FormArray;
		const form = stepsData.at(fromIndex);
		stepsData.removeAt(fromIndex, { emitEvent: false });
		stepsData.insert(toIndex, form);
		this.editFlowForm.markAsDirty();
		this.cdr.markForCheck();
		// The moved editors measured themselves in their old place.
		setTimeout(() =>
			document.querySelectorAll<HTMLElement & { CodeMirror?: { refresh: () => void } }>('.code-flow-list .CodeMirror').forEach(el => el.CodeMirror?.refresh()),
		);
	}

	/** A Step shows its Connection when it has one, or when its Component needs one. */
	private showsConnection(step: IStep): boolean {
		return !!step.connectionId || this.componentsWithConnection.includes(step.componentType?.toLowerCase());
	}

	addConnection(step, index): void {
	     this.enableConnection[index] = true;
	}

	/** A Connection added to a Step is no longer needed: it is hidden again and the Step is saved without it. */
	removeConnection(step, index): void {
		this.enableConnection[index] = false;
		step.connectionId = null;
		const connection = this.stepFormAt(index).controls.connection;
		connection.setValue(null);
		connection.markAsDirty();
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
      // The Operation (a Handler Flow's Source), Responses and Call Flows keep their options in the Step itself.
      if (this.editsOwnOptions(i)) {
        return;
      }
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

	/**
	 * Opens the large Route editor with the Route as typed in the Step. A Route saved there is the Step's Route from
	 * then on; closing it without saving keeps what the Step has.
	 */
	createOrEditRoute(step: IStep, form: FormGroup): void {
		const typed: IRoute = {
			...this.routeOf(form.value.route),
			name: form.value.routeName ?? '',
			content: form.value.routeContent ?? '',
		};
		const modalRef = this.routePopupService.routeModalRef(RouteDialogComponent, typed, this.flow.type);
		modalRef.result.then(
			(route: IRoute) => this.setRoute(step, form, route),
			(route: IRoute | string) => this.setRoute(step, form, route),
		);
	}

	private setRoute(step: IStep, form: FormGroup, route: IRoute | string | undefined): void {
		if (typeof route !== 'object' || !route?.id) {
			return;
		}
		if (form.value.route !== route.id) {
			form.markAsDirty();
		}
		step.routeId = route.id;
		form.patchValue({ route: route.id, routeName: route.name, routeContent: route.content });
		this.routeService.getAllRoutes().subscribe({
			next: res => (this.routes = res.body),
			error: res => this.onError(res.body),
		});
	}

	private routeOf(id: number | null | undefined): IRoute | undefined {
		return id ? this.routes?.find(route => route.id === id) : undefined;
	}

	/** Saves the Routes as typed in the Flow's Route Steps, and gives each Step the id of its Route. */
	private saveRoutes$(): Observable<unknown> {
		const stepsData = this.editFlowForm.controls.stepsData as FormArray;
		const saves = this.steps.map((step, index) => {
			const form = stepsData.at(index) as FormGroup;
			if (!isRouteStep(step.stepType, this.activeEditor)) {
				return of(null);
			}
			const fields = { name: form.value.routeName, content: form.value.routeContent };
			if (!fields.name?.trim() && !fields.content?.trim()) {
				// An Error handler left empty has no Route.
				step.routeId = null;
				form.patchValue({ route: null });
				return of(null);
			}
			const route = routeToSave(fields, this.routeOf(step.routeId));
			if (!route) {
				return of(null);
			}
			return (route.id ? this.routeService.update(route) : this.routeService.create(route)).pipe(
				map(saved => {
					step.routeId = saved.body.id;
					form.patchValue({ route: saved.body.id });
					return saved;
				}),
			);
		});
		return forkJoin(saves).pipe(
			switchMap(() => this.routeService.getAllRoutes()),
			map(res => (this.routes = res.body)),
		);
	}

  createOrEditConnection(step, connectionType: string, formConnection: AbstractControl): void {

    const previousConnectionId = formConnection.value;
    step.connectionId = previousConnectionId;

    // A Route Step has no Component, so the dialog lets the user pick the type
    connectionType = this.connectionsList.getConnectionType(step.componentType) || connectionType;

    const modalRef = this.connectionPopupService.open(ConnectionDialogComponent as Component, step.connectionId || null, connectionType);

    modalRef.then((res) => {
       // Save hands back the Connection; Cancel or close keeps the one that was selected
       const done = (outcome: any) => this.setConnection(step, outcome?.id ?? previousConnectionId, formConnection);
       res.result.then(done, done);
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
        this.cdr.markForCheck();
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
				if (!switchedTab && !this.useCanvas) {
					this.showInvalidCodeTab();
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

	save(then: AfterSave = 'stay'): any {
		// Save & manage always ends on Manage: a Flow without unsaved changes has nothing to save first.
		if (then === 'return' && this.flow?.id && !this.hasUnsavedChanges) {
			this.router.navigate(['/']);
			return;
		}

		this.afterSaveAction = then;
		this.savedFlowName = this.flow.name;
		this.formSubmitted = true;
		this.savingFlowFailed = false;
		this.savingFlowSuccess = false;

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
		} else if (this.steps.some(step => isRouteStep(step.stepType, this.activeEditor))) {
		  this.saveRoutes$()
		    .pipe(takeUntilDestroyed(this.destroyRef))
		    .subscribe({
		      next: () => (this.flow.id ? this.updateFlow() : this.createFlow()),
		      error: () => {
		        this.savingFlowFailedMessage = 'The Routes could not be saved. Give each Route a name no other Route has.';
		        this.savingFlowFailed = true;
		      },
		    });
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
         this.fillLogPaths();
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
     .subscribe({
       next: () => this.afterSave(),
       error: () => {
         this.savingFlowFailed = true;
         this.isSaving = false;
       },
     });
  }

  createFlow(){
		this.flow.integrationId = this.integrations[0].id;

    this.flowService
      .create(this.flow)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(flowUpdated => {
          this.flow = flowUpdated.body;
          this.fillLogPaths();
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

  /**
   * A Source, Action or Route links out under its own name; an Action, Sink, Route or Script links in under the name of the
   * Step before it. A Script links out only when another Step follows it. The Error handler isn't part of the chain.
   */
  private createLinks$(): Observable<unknown> {
    const requests: Observable<unknown>[] = [];
    let previousStepId = 0;
    const chain = this.steps.filter(step => step.stepType !== 'ERROR');

    chain.forEach((step, index) => {
      const hasNext = index < chain.length - 1;
      if (step.stepType === 'ACTION' || step.stepType === 'SOURCE' || step.stepType === 'ROUTE' || (step.stepType === 'SCRIPT' && hasNext)) {
        const linkName = this.flow.id + '-' + step.id;
        requests.push(this.linkService.create(this.setLink(linkName, step.id, 'out')));
      }

      if (step.stepType === 'ACTION' || step.stepType === 'SINK' || step.stepType === 'ROUTE' || step.stepType === 'SCRIPT') {
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
      const stepsData = this.editFlowForm.controls.stepsData as FormArray;
      this.steps.forEach(
      				(step: Step, index) => {
      					if (!isRouteStep(step.stepType, this.activeEditor)) {
      						return;
      					}
      					const form = stepsData.at(index).value;
      					const missing = missingRouteFields(step.stepType, { name: form.routeName, content: form.routeContent });
      					if (missing.name || missing.content) {
                    this.savingFlowFailedMessage = missing.name ? 'Name each Route.' : 'Routes cannot be empty.';
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

	canvasWarnings: Problem[] = [];

	@ViewChild(FlowCanvasComponent) flowCanvas?: FlowCanvasComponent;

	/** Set while a Handler Flow is being cloned: the clone's Source becomes a placeholder. */
	private clonedHandler?: IApiHandler;

	/** The Operation's URL is the runtime's REST listener and the Operation's runtime path. */
	private loadOperationUrl(): void {
		const handler = this.handler;
		this.operationUrl = undefined;
		if (!handler) {
			return;
		}
		this.apiService.listenerUrl().subscribe({
			next: (listener) => {
				this.operationUrl = operationUrl(listener, handler.runtimePath);
				this.cdr.markForCheck();
			},
			error: () => undefined,
		});
	}

	/** What the side panel edits the Step at this index with. */
	panelFor(index: number): 'operation' | 'response' | 'callFlow' | 'step' {
		const step = this.steps[index];
		if (this.handler && step?.stepType === StepType.SOURCE) {
			return 'operation';
		}
		const design = this.canvasGraph?.steps.find(s => s.key === this.stepKeys[index]);
		if (design && this.canvasGraph && isResponse(this.canvasGraph, design)) {
			return 'response';
		}
		const componentType = (this.stepFormAt(index)?.value.componentType ?? step?.componentType ?? '').toLowerCase();
		return componentType === 'flowlink' && (step?.stepType === StepType.ACTION || step?.stepType === StepType.SINK) ? 'callFlow' : 'step';
	}

	/** Whether a Step's options are edited by its own panel rather than by option rows. */
	private editsOwnOptions(index: number): boolean {
		return this.panelFor(index) !== 'step';
	}

	get selectedProblem(): string | undefined {
		const selection = this.selection;
		return selection.type === 'step' ? this.canvasProblems.find(p => p.stepKey === selection.key)?.message : undefined;
	}

	get selectedWarning(): string | undefined {
		const selection = this.selection;
		return selection.type === 'step' ? this.canvasWarnings.find(p => p.stepKey === selection.key)?.message : undefined;
	}

	/** A Response's settings changed in its panel: the body is the Step's uri, the rest its options. */
	onResponseChange(index: number, settings: { uri: string | undefined; options: string }): void {
		this.steps[index].options = settings.options;
		const uri = this.stepFormAt(index).controls.uri;
		uri.setValue(settings.uri ?? '');
		uri.markAsDirty();
	}

	onCallFlowChange(index: number, options: string): void {
		this.steps[index].options = options;
		this.stepFormAt(index).markAsDirty();
		this.refreshCanvas();
	}

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

	/** The visual editor and the Route editor switch between Design (Code) and Test. */
	get hasModes(): boolean {
		return hasModes(this.activeEditor);
	}

	/** What the selected Router is called, shown read-only as its component. */
	get selectedRouterTitle(): string | undefined {
		const selection = this.selection;
		const router = selection.type === 'step' ? this.canvasGraph?.steps.find(s => s.key === selection.key && s.kind === 'ROUTER') : undefined;
		return router ? routerTitle(router) : undefined;
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

	/** Trace is the Flow's log level switched between TRACE and OFF. */
	get traceOn(): boolean {
		return this.editFlowForm?.controls.logLevel.value === LogLevelType.TRACE;
	}

	setTrace(on: boolean): void {
		const logLevel = this.editFlowForm.controls.logLevel;
		logLevel.setValue(on ? LogLevelType.TRACE : LogLevelType.OFF);
		logLevel.markAsDirty();
	}

	get flowIsDraft(): boolean {
		return this.canvasProblems.length > 0;
	}

	/** Puts a Flow on the canvas; a new Flow made from an Example Flow starts with that example's Steps and Links. */
	private loadDesigner(flow: IFlow, template?: FlowTemplate): void {
		const example = template ? templateFlow(template) : undefined;
		const graph = example?.graph ?? loadFlowGraph(flow, this.handler);

		this.resetSteps();
		this.stepKeys = [];
		(<FormArray>this.editFlowForm.controls.stepsData).clear();

		graph.steps.forEach(designStep => {
			const saved = example?.steps.get(designStep.key) ?? (flow.steps ?? []).find(step => step.id != null && step.id === designStep.id);
			if (saved) {
				this.addSavedStepForm(saved, designStep.key);
			} else {
				this.addNewStepForm(designStep.kind as StepType, this.defaultComponentType(designStep.kind, designStep.componentType), designStep.key);
			}
		});

		if (graph.errorStep) {
			this.addSavedStepForm(graph.errorStep, ERROR_STEP_KEY);
		} else {
			this.addSavedStepForm(defaultErrorHandlerStep(), ERROR_STEP_KEY);
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
		this.stepKeys.push(key);
		this.addStepForm(step);
	}

	/** Adds a form for a Step that already has its settings, after the Steps there are. */
	private addStepForm(step: IStep): void {
		const index = this.steps.length;
		this.numberOfSteps = this.numberOfSteps + 1;

		if (typeof this.stepsOptions[index] === 'undefined') {
			this.stepsOptions.push([]);
		}
		this.steps.push(step);
		(<FormArray>this.editFlowForm.controls.stepsData).insert(index, this.initializeStepData(step));
		this.setTypeLinks(step, index);
		this.getOptions(step, this.editFlowForm.controls.stepsData.get(index.toString()), this.stepsOptions[index], index);
		this.enableConnection[index] = this.showsConnection(step);
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
		if (this.testRun && graphShape(this.canvasGraph) !== this.testedShape) {
			// The Flow changed since the test ran, so what the Steps show of it would mislead.
			this.clearTestRun();
		}
		this.checkCanvas();
		// Required path parts are known once a Component's schema is read; check again when new ones arrive.
		this.schemas.load(this.canvasGraph.steps.map(step => step.componentType)).subscribe(() => this.checkCanvas());
	}

	private checkCanvas(): void {
		if (this.canvasGraph) {
			this.canvasProblems = problems(this.canvasGraph, this.schemas.pathRule);
			this.canvasWarnings = [...warnings(this.canvasGraph), ...variableWarnings(this.canvasGraph.steps, this.knownVariables)];
			this.cdr.markForCheck();
		}
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
			.forEach(step => {
				this.addNewStepForm(step.kind as StepType, this.defaultComponentType(step.kind, step.componentType), step.key);
				// A new Response starts with its status, which the graph gave it.
				if (step.options) {
					this.steps[this.stepKeys.indexOf(step.key)].options = step.options;
				}
			});
	}

	/** Whether the side panel is hidden, to give the canvas the whole width. Hidden by default; remembered in this browser. */
	sidePanelCollapsed = readPanelCollapsed();

	togglePanel(): void {
		this.setPanelCollapsed(!this.sidePanelCollapsed);
	}

	/**
	 * A double-click on a Step shows it in the side panel when the panel is hidden, and hides the panel when it is shown.
	 * In Test it goes back to Design to edit the Step.
	 */
	toggleStepEditor(key: string): void {
		const fromTest = this.viewMode === 'test';
		this.setMode('design');
		this.onSelectionChange({ type: 'step', key });
		this.setPanelCollapsed(fromTest ? false : !this.sidePanelCollapsed);
	}

	// Modes
	//
	// Design edits the Flow on the canvas. Test runs the saved Flow: the canvas is read-only and shows the messages each
	// Step completed and failed, the toolbar has the Flow's Log and Camel route, and the side panel the Test panel and
	// the stats. The mode is in the URL (view=test), so a reload keeps it.

	viewMode: EditorMode = 'design';
	/** What Test shows in place of the canvas. */
	testView: 'flow' | 'log' | 'route' = 'flow';
	/** What the side panel shows in Test. */
	testPanelTab: 'test' | 'stats' = 'test';
	/** The completed and failed messages of each Step, while the Flow runs. */
	runCounts?: Map<string, IFlowCounts>;

	/** What Test shows: the Flow (on the canvas, or its Routes or Scripts), its Log and the Camel route the runtime built. */
	get testTabs(): readonly { id: 'flow' | 'log' | 'route'; label: string; icon: string }[] {
		if (this.useCanvas) {
			return CANVAS_TEST_TABS;
		}
		return this.activeEditor === 'script' ? SCRIPT_TEST_TABS : ROUTE_TEST_TABS;
	}

	// Route editor
	//
	// Code edits the Routes, the Error handler and the Notes, each on a tab. Test shows the Routes read-only beside the
	// Test panel and the stats, like the visual editor shows its canvas.

	routeTab: 'routes' | 'errorHandler' | 'notes' = 'routes';

	readonly routeTabs = [
		{ id: 'routes', label: 'Routes', icon: 'list' },
		{ id: 'errorHandler', label: 'Error handler', icon: 'exclamation-triangle' },
		{ id: 'notes', label: 'Notes', icon: 'file-alt' },
	] as const;

	showRouteTab(tab: 'routes' | 'errorHandler' | 'notes'): void {
		this.routeTab = tab;
		this.scrollCodeToTop();
		this.cdr.markForCheck();
	}

	/** A tab of the Route or Script editor opens at its top, not where the last tab was scrolled to. */
	private scrollCodeToTop(): void {
		document.querySelector('.code-flow-pane')?.scrollTo({ top: 0 });
	}

	/** The saved id of the Route a test message goes into: the first one that is a route, not a routeConfiguration. */
	get routeEntryStepId(): string | undefined {
		const index = this.routeIndices.find(i => !isRouteConfiguration(this.stepFormAt(i)?.value.routeContent));
		const id = index === undefined ? undefined : this.steps[index].id;
		return id != null ? String(id) : undefined;
	}

	/** The read-only editor options of the Routes in Test, in the editor's theme. */
	readOnlyRouteOptions(): Record<string, unknown> {
		const theme = this.themeService.editorTheme();
		if (this.readOnlyRouteOptionsCache?.['theme'] !== theme) {
			this.readOnlyRouteOptionsCache = { mode: 'xml', theme, lineNumbers: true, readOnly: true, viewportMargin: Infinity };
		}
		return this.readOnlyRouteOptionsCache;
	}

	private readOnlyRouteOptionsCache?: Record<string, unknown>;

	/** After a failed save, Code with the tab that has the first invalid Step, so its field can be focused. */
	private showInvalidCodeTab(): void {
		this.setMode('design');
		const stepsData = this.editFlowForm.controls.stepsData as FormArray;
		const firstInvalid = stepsData.controls.findIndex(form => form.invalid);
		const stepType = this.steps[firstInvalid]?.stepType;
		if (this.activeEditor === 'script') {
			this.scriptTab =
				stepType === StepType.ERROR ? 'errorHandler' : stepType === StepType.SOURCE || stepType === StepType.SINK ? 'source' : 'scripts';
		} else {
			this.routeTab = stepType === StepType.ERROR ? 'errorHandler' : 'routes';
		}
		this.cdr.detectChanges();
	}

	showTestView(view: 'flow' | 'log' | 'route'): void {
		this.testView = view;
		this.cdr.markForCheck();
	}

	/** Switches the mode; a new Flow has nothing to test until it is saved. */
	setMode(mode: EditorMode): void {
		if (mode === this.viewMode || (mode === 'test' && !this.flow?.id)) {
			return;
		}
		this.applyMode(mode);
		const url = this.router.parseUrl(this.location.path());
		url.queryParams = { ...url.queryParams };
		if (mode === 'test') {
			url.queryParams['view'] = 'test';
		} else {
			delete url.queryParams['view'];
		}
		// Not through the router: its query params would load the Flow again and drop the unsaved changes.
		this.location.replaceState(this.router.serializeUrl(url));
		this.cdr.markForCheck();
	}

	private applyMode(mode: EditorMode): void {
		this.viewMode = mode;
		this.testOpen = mode === 'test';
		if (mode === 'test') {
			// Test always opens with its panel; Design keeps the choice this browser remembered.
			if (this.sidePanelCollapsed) {
				this.flowCanvas?.keepInView();
			}
			this.sidePanelCollapsed = false;
		} else {
			this.sidePanelCollapsed = readPanelCollapsed();
			this.testView = 'flow';
			this.runCounts = undefined;
		}
	}

	onRunCountsChange(counts: Map<string, IFlowCounts> | undefined): void {
		this.runCounts = counts;
		this.cdr.markForCheck();
	}

	/** Save & start, or Save & restart while the Flow runs: Test runs the saved Flow. */
	saveAndTest(): void {
		this.save(this.header?.running() ? 'restart' : 'start');
	}

	// Test panel
	//
	// Test mode shows it in the side panel, whatever is selected: selecting a Step shows what that Step did in the last
	// test run. The run is kept here, so the canvas can mark each Step, until the Flow changes.

	testOpen = false;
	testRun?: FlowTestRun;
	testMarks?: Map<string, StepRunMark>;
	/** What each Step did in the last test run, by its saved id, in an editor without a canvas. */
	private stepRuns?: Map<string, StepRun>;
	private testedShape?: string;

	isTestOpen(): boolean {
		return !this.sidePanelCollapsed && this.testOpen;
	}

	openTest(): void {
		this.setMode('test');
		this.testPanelTab = 'test';
		this.setPanelCollapsed(false);
		this.cdr.markForCheck();
	}

	onTestRan(run: FlowTestRun): void {
		this.testRun = run;
		if (!this.canvasGraph) {
			// A Route or Script Flow has no canvas to mark; the Script editor shows each Script's run.
			this.stepRuns = stepRunsById(run);
			this.cdr.markForCheck();
			return;
		}
		this.testMarks = runResultsByStepKey(this.canvasGraph, run);
		this.testedShape = graphShape(this.canvasGraph);
		this.cdr.markForCheck();
	}

	/** Edit Step in the Test panel goes back to Design with the Step's settings. */
	editStepFromTest(key: string): void {
		this.setMode('design');
		this.onSelectionChange({ type: 'step', key });
	}

	get selectedStepKey(): string | undefined {
		return this.selection.type === 'step' ? this.selection.key : undefined;
	}

	private clearTestRun(): void {
		this.testRun = undefined;
		this.testMarks = undefined;
		this.stepRuns = undefined;
		this.testedShape = undefined;
	}

	private failedStart?: { failure: FlowFailure | null; problems: Problem[]; graph?: FlowGraph; base: Problem[] };

	/** The canvas problems, with the Steps a failed start named; kept while neither changes, so the canvas isn't redrawn. */
	problemsWithFailure(failure: FlowFailure | null): Problem[] {
		const last = this.failedStart;
		if (!last || last.failure !== failure || last.graph !== this.canvasGraph || last.base !== this.canvasProblems) {
			const named = this.canvasGraph ? failureProblems(this.canvasGraph.steps, failure) : [];
			this.failedStart = { failure, graph: this.canvasGraph, base: this.canvasProblems, problems: named.length ? [...this.canvasProblems, ...named] : this.canvasProblems };
		}
		return this.failedStart.problems;
	}

	/** What the side panel shows while no Step or Link is selected: the Flow settings or its Error handler. */
	flowPanel: 'settings' | 'errorHandler' = 'settings';

	/** Whether the side panel shows this part of the Flow settings. */
	isFlowPanelOpen(panel: 'settings' | 'errorHandler'): boolean {
		return !this.sidePanelCollapsed && !this.testOpen && this.selection.type === 'flow' && this.flowPanel === panel;
	}

	openFlowSettings(): void {
		this.openFlowPanel('settings');
	}

	openErrorHandler(): void {
		this.openFlowPanel('errorHandler');
	}

	private openFlowPanel(panel: 'settings' | 'errorHandler'): void {
		this.testOpen = false;
		this.onSelectionChange({ type: 'flow' });
		this.flowPanel = panel;
		this.setPanelCollapsed(false);
	}

	private setPanelCollapsed(collapsed: boolean): void {
		if (this.sidePanelCollapsed && !collapsed) {
			// The panel takes room from the canvas, so Steps may end up under it.
			this.flowCanvas?.keepInView();
		}
		this.sidePanelCollapsed = collapsed;
		if (this.viewMode !== 'design') {
			return;
		}
		try {
			localStorage.setItem(PANEL_COLLAPSED_KEY, String(collapsed));
		} catch {
			// Without storage the panel is simply hidden again next time.
		}
	}

	onSelectionChange(selection: DesignerSelection): void {
		this.selection = selection;
		this.flowPanel = 'settings';
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
			!window.confirm(`Delete this ${routerTitle(step)} Router? Its Default branch takes its place and its other Branches are deleted.`)
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

	onMoveSteps(moves: StepMove[]): void {
		this.edit(moveSteps(this.designer!.current, moves));
	}

	onLinkChange(settings: Partial<LinkSettings>): void {
		const selection = this.selection;
		if (selection.type === 'link') {
			this.edit(updateLink(this.designer!.current, selection.to, settings));
		}
	}

	autoArrangeCanvas(): void {
		this.edit({ outcome: 'accepted', graph: autoArrange(this.designer!.current) });
		this.flowCanvas?.keepInView();
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
		if (!this.designer || isTypingTarget(target) || this.viewMode !== 'design') {
			return;
		}
		// A dialog or drawer on top of the canvas has the keys; Ctrl+S is the form's own shortcut (jhiSaveShortcut).
		const covered = this.modalService.hasOpenModals() || this.offcanvas.hasOpenOffcanvas();
		if ((event.ctrlKey || event.metaKey) && ['z', 'y'].includes(event.key.toLowerCase())) {
			// Always kept from the browser: its own undo would take back text typed earlier in a field of the editor.
			event.preventDefault();
			if (covered) {
				return;
			}
			if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
				this.undo();
			} else {
				this.redo();
			}
			return;
		}
		if (covered) {
			return;
		}
		// Space adds a Step, like the + that fits the selection. On a focused button or link, Space keeps its usual meaning.
		if (event.key === ' ' && !event.ctrlKey && !event.metaKey && !event.altKey && !target.closest('button, a')) {
			if (this.flowCanvas?.openStepPicker(this.selection)) {
				event.preventDefault();
			}
			return;
		}
		// Backspace too: a Mac keyboard's delete key sends it.
		if ((event.key === 'Delete' || event.key === 'Backspace') && !event.ctrlKey && !event.metaKey) {
			const selection = this.selection;
			if (selection.type === 'step') {
				this.onDeleteStep(selection.key);
			} else if (selection.type === 'link') {
				this.onDeleteBranch(selection.to);
			}
		}
	}

	/** True while the Flow has edits that are not saved; used to warn before leaving the designer. */
	get hasUnsavedChanges(): boolean {
		return !!this.designer?.hasUnsavedChanges || !!this.editFlowForm?.dirty;
	}

	/**
	 * Save & manage goes back to Manage. Otherwise the editor stays: the URL gets the Flow's id (a new Flow only has
	 * one now). A Visual Flow keeps its Steps and undo history (they already have their saved ids); other Flows are
	 * loaded again so every Step has its saved id. Save & start then starts it, and Save & restart restarts the running
	 * Flow; a failed start shows as Error.
	 */
	private afterSave(): void {
		this.savingFlowSuccess = true;
		this.isSaving = false;
		this.editFlowForm.markAsPristine();
		const then = this.afterSaveAction;
		this.afterSaveAction = 'stay';
		if (then === 'return') {
			this.router.navigate(['/']);
			return;
		}
		const url = this.router.createUrlTree(['/flow/editor', this.flow.id], {
			queryParams: { mode: 'edit', editor: this.activeEditor, id: this.flow.id, view: this.viewMode === 'test' ? 'test' : undefined },
		});
		this.location.replaceState(this.router.serializeUrl(url));
		// Save & Test: the editors go on to test the Flow they start.
		if (this.hasModes && (then === 'start' || then === 'restart')) {
			this.setMode('test');
		}
		if (this.activeEditor === 'script') {
			// What each Script made of the last test message was made by the Scripts as they were.
			this.clearTestRun();
		}
		if (this.useCanvas && this.designer) {
			this.refreshCanvas();
		} else {
			this.load(this.flow.id);
		}
		if (then === 'start') {
			this.header?.start(this.flow.id);
		} else if (then === 'restart') {
			this.header?.restart(this.flow.id);
		}
	}

	/**
	 * A logging Error Handler, and the Log Step of a Script Flow's result, log to FlowName/FlowID; the path is set once
	 * the Flow has its id.
	 */
	private fillLogPaths(): void {
		this.steps
			.filter(step => this.followsFlowWhenLogging(step))
			.forEach(step => (step.uri = errorHandlerPathOnSave(step, this.flow, this.savedFlowName)));
	}

	/** The Steps whose path follows the Flow while they log to an empty path: the Error Handler and a Script Flow's Sink. */
	private followsFlowWhenLogging(step: IStep | undefined): boolean {
		return step?.stepType === StepType.ERROR || (step?.stepType === StepType.SINK && this.activeEditor === 'script');
	}

	get nameControl(): FormControl<string> {
		return this.editFlowForm.controls.name as FormControl<string>;
	}

	/** Why the Flow is a Draft, or null. Only a Visual Flow can be a Draft. */
	get draftReason(): string | null {
		return this.useCanvas && this.canvasProblems.length > 0 ? this.canvasProblems[0].message : null;
	}

	/** The path the Step at this index logs to automatically, while the user leaves it to the Flow. */
	autoLogPath(index: number): string | undefined {
		const form = this.followsFlowWhenLogging(this.steps[index]) ? this.stepFormAt(index)?.getRawValue() : undefined;
		return form
			? automaticErrorHandlerPath({ componentType: form.componentType, uri: form.uri }, { name: this.nameControl.value, id: this.flow?.id }, this.flow?.name)
			: undefined;
	}

	/** The Component a test message goes to: the Source's, or in a Route Flow that of the first Route's `<from>`. */
	get sourceComponent(): string | undefined {
		const source = sourceStepOf(this.steps)?.componentType;
		if (source) {
			return source;
		}
		const route = firstRouteStepOf(this.steps);
		return route ? routeSourceOf(this.stepFormAt(this.steps.indexOf(route))?.value.routeContent)?.componentType : undefined;
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
		let savedIds = new Map<string, number>();
		const flowSaved$ = this.flow.id ? this.flowService.update(this.flow) : this.flowService.create(this.flow);

		flowSaved$
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap(flow => {
					this.flow = flow.body;
					this.fillLogPaths();
					stepsInGraph.forEach(step => (step.flowId = this.flow.id));
					return this.stepService.updateMultiple(stepsInGraph);
				}),
				switchMap(saved => {
					const stepIds = new Map<string, number>(keys.map((key, i) => [key, saved.body[i].id]));
					savedIds = stepIds;
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
					this.adoptSavedIds(savedIds);
					this.afterSave();
				},
				error: () => {
					this.savingFlowFailed = true;
					this.isSaving = false;
				},
			});
	}

	/**
	 * Gives the Flow and every Step, and their forms, the id they were saved with, so editing goes on with the same undo
	 * history. A Step that isn't in the graph has been deleted (or was never saved) and loses its id: undoing its
	 * deletion saves it as a new Step.
	 */
	private adoptSavedIds(stepIds: Map<string, number>): void {
		this.editFlowForm.controls.id.setValue(this.flow.id, { emitEvent: false });
		this.stepKeys.forEach((key, index) => {
			const id = stepIds.get(key);
			this.steps[index].id = id;
			this.stepFormAt(index)?.controls.id.setValue(id ?? null, { emitEvent: false });
		});
		this.cdr.markForCheck();
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

type AfterSave = 'stay' | 'start' | 'restart' | 'return';

/** The graph key of a Flow's Error Step, which has its own Error handler panel rather than a place on the canvas. */
const ERROR_STEP_KEY = 'error';

const PANEL_COLLAPSED_KEY = 'flow-designer.panel-collapsed';

function readPanelCollapsed(): boolean {
	try {
		return localStorage.getItem(PANEL_COLLAPSED_KEY) !== 'false';
	} catch {
		return true;
	}
}

const CANVAS_TEST_TABS = [
	{ id: 'flow', label: 'Visual flow', icon: 'sitemap' },
	{ id: 'log', label: 'Log', icon: 'file-alt' },
	{ id: 'route', label: 'Camel route', icon: 'code' },
] as const;

/** The Route editor shows its Routes where the visual editor shows its canvas. */
const ROUTE_TEST_TABS = [{ id: 'flow', label: 'Routes', icon: 'list' }, ...CANVAS_TEST_TABS.slice(1)] as const;

/** The Script editor shows its Scripts there. */
const SCRIPT_TEST_TABS = [{ id: 'flow', label: 'Scripts', icon: 'code' }, ...CANVAS_TEST_TABS.slice(1)] as const;

/** What the Script editor shows in Code. */
type ScriptTab = 'scripts' | 'source' | 'errorHandler' | 'notes';

/** The editors with a Design (or Code) and a Test mode: the visual editor, the Route editor and the Script editor. */
function hasModes(editor: string | undefined): boolean {
	return opensOnCanvas(editor) || editor === 'route' || editor === 'script';
}

/** The height in pixels the designer never shrinks below, however small the window. */
const DESIGNER_MIN_HEIGHT = 400;

export class Option {
  constructor(public key?: string, public value?: string) {}
}
