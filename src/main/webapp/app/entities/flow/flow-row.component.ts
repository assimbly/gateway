import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule, NgbModal, NgbOffcanvas, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { Flow, IFlow, LogLevelType } from 'app/shared/model/flow.model';
import { isDraft, loadFlowGraph, opensOnCanvas } from './designer/flow-graph';
import { FlowService } from './flow.service';
import { FlowDeleteDialogComponent } from 'app/entities/flow/flow-delete-dialog.component';

import { Step, StepType } from 'app/shared/model/step.model';
import { StepService } from '../step/step.service';
import { IntegrationService } from '../integration/integration.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { Collectors } from 'app/shared/collect/collectors';
import { OverflowActionDirective, RowActions, StatusControls, Truncate } from 'app/shared/table';
import { FlowRowAlerts } from './flow-row-alerts.component';
import { FlowRowStats, FlowStatsSection } from './flow-row-stats.component';
import {
  FlowAction,
  FlowFailure,
  FlowStatusView,
  countLabel,
  failureOfError,
  flowEventOf,
  flowFailureOf,
  flowStatusView,
  flowTypeLabel,
  hasRun,
  sourceStepOf,
  testMessageBlocked,
} from './flow-status';
import { Components } from 'app/shared/camel/component-type';
import { ComponentSchemas } from './component-schemas.service';
import { FlowAlertsDrawerComponent } from './flow-alerts-drawer.component';

import { Router } from '@angular/router';
import dayjs from 'dayjs/esm';

import { HttpResponse } from '@angular/common/http';
import { forkJoin, Observable, Subscription, switchMap, tap } from 'rxjs';

enum Status {
  active = 'active',
  paused = 'paused',
  inactive = 'inactive',
  inactiveError = 'inactiveError',
}

@Component({
  selector: '[jhi-flow-row]',
  templateUrl: './flow-row.component.html',
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    NgbDropdownModule,
    NgbTooltip,
    RowActions,
    OverflowActionDirective,
    StatusControls,
    Truncate,
    FlowRowAlerts,
    FlowRowStats,
  ],
})
export class FlowRowComponent implements OnInit, OnDestroy {
  sslUrl: any;

  @Input() flow: Flow;

  steps: Array<Step> = [new Step()];
  fromStep: Array<Step> = [];
  toSteps: Array<Step> = [];
  errorStep: Step = new Step();
  responseSteps: Array<Step> = [];

  public isFlowStarted: boolean;
  public isFlowRestarted: boolean;

  public isFlowPaused: boolean;
  public isFlowResumed: boolean;

  public isFlowStopped: boolean;
  public disableActionBtns: boolean;
  /** A Flow designed on the canvas that is still incomplete; it can't be started. */
  public isDraft = false;
  /** Whether the Flow has run since the Gateway started; until then its counts show `—`. */
  public ran = false;

  public flowDetails: string;
  public flowStatus: string;
  public flowStatusError: string;
  public isFlowStatusOK: boolean;
  public flowStatsLoading = false;
  public flowStatsEmpty = false;
  public flowStatsSections: FlowStatsSection[] = [];
  public flowStatusButton: string;
  public flowStartTime: any;
  public clickButton = false;

  /** Why the Flow last failed to start, stop, pause or resume; null when it didn't. */
  public failure: FlowFailure | null = null;

  public flowAlerts: string;
  public numberOfAlerts: any;
  public showNumberOfItems: number;
  public completedCount: number | null = null;
  public failedCount: number | null = null;

  fromStepTooltips: Array<string> = [];
  toStepsTooltips: Array<string> = [];
  errorStepTooltip: string;
  responseStepTooltips: Array<string> = [];
  public statusFlow: Status;
  public previousState: string;
  public p = false;
  lastError: string;

  flowRowID: string;
  flowRowErrorStepID: string;

  filter: Filter;

  statusMessage: any;

  intervalTime: any;

  private readonly components = inject(Components);
  private readonly schemas = inject(ComponentSchemas);
  private readonly offcanvas = inject(NgbOffcanvas);
  private destroyed = false;
  private readonly subscriptions = new Subscription();

  alreadyConnectedOnce = false;

  constructor(
    private flowService: FlowService,
    private stepService: StepService,
		private integrationService: IntegrationService,
    private modalService: NgbModal,
    private router: Router,
    private eventManager: EventManager,
	  private collectors: Collectors,
    private changeDetector: ChangeDetectorRef
  ) {}

  get state(): FlowStatusView {
    return flowStatusView(this.statusFlow, this.isDraft);
  }

  shows(action: FlowAction): boolean {
    return this.state.controls.includes(action);
  }

  isDisabled(action: FlowAction): boolean {
    return this.state.disabled.includes(action);
  }

  /** Why the ⋮ menu's Send test message is unavailable, or null when it can be sent. */
  get testMessageBlocked(): string | null {
    const source = sourceStepOf(this.flow.steps)?.componentType;
    return testMessageBlocked(this.statusFlow, source ? (this.components.types.find(type => type.name === source) ?? { name: source }) : null);
  }

  sendTestMessage(): void {
    this.router.navigate(['/flow/message-sender'], { queryParams: { flowId: this.flow.id } });
  }

  get typeLabel(): string {
    return flowTypeLabel(this.flow.type);
  }

  count(value: number | null): string {
    return countLabel(value, this.ran);
  }

  run(action: FlowAction): void {
    switch (action) {
      case 'start':
        return this.start();
      case 'stop':
        return this.stop();
      case 'pause':
        return this.pause();
      case 'resume':
        return this.resume();
      case 'restart':
        return this.restart();
    }
  }

  ngOnInit() {
    this.setFlowStatusDefaults();
    this.getStatus(this.flow.id);

    this.steps = this.flow.steps;
    this.getSteps();
    if (opensOnCanvas(this.flow.type)) {
      const graph = loadFlowGraph(this.flow);
      this.isDraft = isDraft(graph);
      // A Step with an empty required path part also makes a Draft, once its Component's schema is read.
      this.subscriptions.add(
        this.schemas.load(graph.steps.map(step => step.componentType)).subscribe(() => {
          const draft = isDraft(graph, this.schemas.pathRule);
          if (draft !== this.isDraft) {
            this.isDraft = draft;
            this.changeDetector.markForCheck();
          }
        }),
      );
    }

    this.registerTriggeredAction();

  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.subscriptions.unsubscribe();
  }

  pollMessages(): void {
    if (this.destroyed || this.statusFlow !== Status.active) {
      return;
    }
    this.loadFlowMessages();
  }

  pollAlerts(): void {
    if (this.destroyed || !this.isFlowStarted) {
      return;
    }
    this.getFlowNumberOfAlerts(this.flow.id);
  }

  /** Opens the Alerts drawer; once they are cleared the row's count goes to zero. */
  openAlerts(): void {
    FlowAlertsDrawerComponent.open(this.offcanvas, { id: this.flow.id!, name: this.flow.name, type: this.flow.type }, () => {
      this.setFlowNumberOfAlerts(0);
      this.changeDetector.detectChanges();
    });
  }

  getStatus(id: number) {
    this.clickButton = true;

    this.subscriptions.add(
      forkJoin(this.flowService.getFlowStatus(id), this.flowService.getFlowAlertsPage(id, 0, 0)).subscribe(([flowStatus, flowAlertsPage]) => {
        if (this.destroyed) {
          return;
        }
        if (flowStatus.body != 'unconfigured') {
          this.setFlowStatus(flowStatus.body);
        }
        this.setFlowNumberOfAlerts(flowAlertsPage.body?.total ?? 0);
      }),
    );
  }

  setFlowStatusDefaults() {
    this.isFlowStatusOK = true;
    this.flowStatus = 'unconfigured';
    this.lastError = '';
    this.setFlowStatus(this.flowStatus, false);
  }

  getFlowStatus(id: number) {
    this.clickButton = true;
    this.subscriptions.add(
      this.flowService.getFlowStatus(id).subscribe(response => {
        if (!this.destroyed) {
          this.setFlowStatus(response.body);
        }
      }),
    );
  }

  setFlowStatus(status: string, refreshView = true): void {

    switch (status) {
      case '':
      case 'unconfigured':
        this.statusFlow = Status.inactive;
        this.isFlowStarted = this.isFlowPaused = false;
        this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
        this.flowStatusButton = `Stopped`;

        break;
      case 'started':
      case 'start':
        this.statusFlow = Status.active;
        this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = false;
        this.isFlowStarted = this.isFlowResumed = true;
        this.flowStatusButton = `Started`;
        this.getFlowAlertsPoll();

        break;
      case 'suspended':
      case 'suspend':
      case 'paused':
      case 'pause':
        this.statusFlow = Status.paused;
        this.isFlowResumed = this.isFlowStopped = this.isFlowRestarted = false;
        this.isFlowPaused = this.isFlowStarted = true;
        this.flowStatusButton = `Paused`;
        break;
      case 'resumed':
      case 'resume':
        this.statusFlow = Status.active;
        this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = false;
        this.isFlowResumed = this.isFlowStarted = true;
        this.flowStatusButton = `Resumed`;
        break;
      case 'restarted':
      case 'restart':
        this.statusFlow = Status.active;
        this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = false;
        this.isFlowResumed = this.isFlowStarted = true;
        this.flowStatusButton = `Restarted`;
        break;
      case 'stopped':
      case 'stop':
        this.statusFlow = Status.inactive;
        this.isFlowStarted = this.isFlowPaused = false;
        this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
        this.flowStatusButton = `Stopped`;
        break;
      case 'error':
      case 'failed':
        this.statusFlow = Status.inactiveError;
        this.isFlowStarted = this.isFlowPaused = false;
        this.flowStatusButton = `Failed`;
        this.failure = failureOfError(this.statusMessage);
        break;
      default:
        this.statusFlow = Status.inactive;
        this.isFlowStarted = this.isFlowPaused = false;
        this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
        this.flowStatusButton = `Unknown`;
        this.failure = flowFailureOf(this.statusMessage);
        break;
    }
    this.ran = this.ran || hasRun(status);
    if (refreshView) {
      this.changeDetector.detectChanges();
    }
    if (this.ran) {
      this.loadFlowMessages();
    } else {
      this.completedCount = null;
      this.failedCount = null;
    }
  }

  getFlowAlertsPoll(): void {
    if (this.destroyed) {
      return;
    }
    this.getFlowNumberOfAlerts(this.flow.id);
  }

  getFlowNumberOfAlerts(id: number) {
    this.clickButton = true;

    this.subscriptions.add(
      this.flowService.getFlowAlertsPage(id, 0, 0).subscribe(response => {
        if (!this.destroyed) {
          this.setFlowNumberOfAlerts(response.body?.total ?? 0);
        }
      }),
    );
  }

  setFlowNumberOfAlerts(numberOfAlerts: number): void {
    const count = Number(numberOfAlerts) || 0;

    if (count === 0) {
      this.flowAlerts = `false`;
      this.numberOfAlerts = 0;
      this.showNumberOfItems = 3;
    } else {
      this.flowAlerts = `true`;
      this.numberOfAlerts = count;
      if (count < 4) {
        this.showNumberOfItems = count;
      } else {
        this.showNumberOfItems = 3;
      }
    }
    this.changeDetector.detectChanges();
  }

  navigateToFlowEditor(mode: string) {

    if(!this.flow.type){
      this.flow.type = 'flow';
    }

    switch (mode) {
        case 'edit':
          this.router.navigate(['../../flow/editor', this.flow.id], {queryParams: { mode: mode, editor: this.flow.type, id: this.flow.id }});
          break;
        case 'clone':
          this.router.navigate(['../../flow/editor', this.flow.id], {queryParams: { mode: mode, editor: this.flow.type, id: this.flow.id }});
          break;
        case 'delete': {
          const modalRef = this.modalService.open(FlowDeleteDialogComponent);
          modalRef.componentInstance.flow = this.flow;
          break;
        }
        default:
          break;
      }
  }

  navigateToStepEditor(mode: string, editorType: string, step: Step) {
    this.router.navigate(['../../flow/editor', this.flow.id], {queryParams: { mode: mode, editor: editorType, stepid: step.id }});
  }

  exportFlow(){
    this.flowService.exportFlowConfiguration(this.flow);
  }

  getFlowDetails() {
    const createdFormatted = dayjs(this.flow.created).format('YYYY-MM-DD HH:mm:ss');
    const lastModifiedFormatted = dayjs(this.flow.lastModified).format('YYYY-MM-DD HH:mm:ss');

    this.flowDetails = `

                <b>ID:</b> ${this.flow.id}<br/>
                <b>Name:</b> ${this.flow.name}<br/>
                <b>Version:</b> ${this.flow.version}<br/><br/>
                <b>Created:</b> ${createdFormatted}<br/>
                <b>Last modified:</b> ${lastModifiedFormatted}<br/><br/>
                <b>Status:</b> ${this.flowStatusButton}<br/>

        `;
  }

  getFlowStatistic(flow: IFlow) {
    this.flowStatsLoading = true;
    this.flowStatsEmpty = false;
    this.flowStatsSections = [];

    const steps = flow.steps ?? [];
    const step =
      steps.find(item => item.stepType === StepType.SOURCE) ??
      steps.find(item => item.stepType === StepType.SCRIPT) ??
      steps.find(item => item.stepType === StepType.ROUTE);
    if (!step?.id) {
      this.flowStatsLoading = false;
      this.flowStatsEmpty = true;
      return;
    }

    const source =
      step.stepType === StepType.SOURCE ? `${step.componentType}://${step.uri}` : `${flow.id}-${step.id}`;
    this.subscriptions.add(
      this.flowService.getFlowStats(flow.id, step.id).subscribe({
        next: res => {
          if (!this.destroyed) {
            this.applyFlowStats(res.body, source);
          }
        },
        error: () => {
          if (this.destroyed) {
            return;
          }
          this.flowStatsLoading = false;
          this.flowStatsEmpty = true;
          this.changeDetector.detectChanges();
        },
      }),
    );
  }

  private applyFlowStats(res, source: string): void {
    const step = res?.step;
    const stats = step?.stats;
    if (!step || step.status !== 'Started' || !stats) {
      this.flowStatsLoading = false;
      this.flowStatsEmpty = true;
      this.flowStatsSections = [];
      this.changeDetector.detectChanges();
      return;
    }

    const pending = stats.pending ?? stats.exchangesInflight ?? 0;
    const failuresHandled = Number(stats.failuresHandled);
    const handled = Number.isFinite(failuresHandled) ? failuresHandled : 0;
    const completed = Number(stats.exchangesCompleted) - handled;
    const failed = Number(stats.exchangesFailed) + handled;
    this.flowStatsSections = [
      {
        title: 'Runtime',
        rows: [
          { label: 'Status', value: String(step.status) },
          { label: 'Started', value: this.formatStatsTimestamp(stats.startTimestamp) },
          { label: 'Running for', value: this.formatStatsDuration(step.uptimeMilliseconds ?? stats.uptimeMilliseconds) },
          { label: 'Idle for', value: this.formatStatsDuration(stats.idleSince) },
        ],
      },
      {
        title: 'Performance',
        rows: [
          { label: 'Average processing', value: this.formatProcessingTime(stats.meanProcessingTime) },
          { label: 'Minimum', value: this.formatProcessingTime(stats.minProcessingTime) },
          { label: 'Maximum', value: this.formatProcessingTime(stats.maxProcessingTime) },
          { label: 'Last', value: this.formatProcessingTime(stats.lastProcessingTime) },
        ],
      },
      {
        title: 'Messages',
        rows: [
          { label: 'Total', value: this.formatCount(stats.exchangesTotal) },
          { label: 'Completed', value: this.formatCount(completed) },
          { label: 'Pending', value: this.formatCount(pending) },
          { label: 'Failed', value: this.formatCount(failed) },
        ],
      },
      {
        title: 'Activity',
        rows: [
          { label: 'First completed', value: this.formatStatsTimestamp(stats.firstExchangeCompletedTimestamp) },
          { label: 'Last completed', value: this.formatStatsTimestamp(stats.lastExchangeCompletedTimestamp) },
          { label: 'First failed', value: this.formatStatsTimestamp(stats.firstExchangeFailureTimestamp) },
          { label: 'Last failed', value: this.formatStatsTimestamp(stats.lastExchangeFailureTimestamp) },
        ],
      },
      {
        title: 'Source',
        rows: [],
        note: source,
      },
    ];
    this.flowStatsLoading = false;
    this.flowStatsEmpty = false;
    this.changeDetector.detectChanges();
  }

  private formatStatsTimestamp(value: unknown): string {
    if (value == null || value === '') {
      return '—';
    }
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      if (numeric <= 0) {
        return '—';
      }
      const date = dayjs(numeric);
      return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '—';
    }
    const date = dayjs(String(value));
    return date.isValid() && date.year() > 1970 ? date.format('YYYY-MM-DD HH:mm:ss') : '—';
  }

  private formatStatsDuration(value: unknown): string {
    const milliseconds = Number(value);
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      return '—';
    }
    const totalSeconds = Math.round(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts: string[] = [];
    if (hours > 0) {
      parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    }
    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    }
    return parts.join(' ');
  }

  private formatProcessingTime(value: unknown): string {
    const milliseconds = Number(value);
    return Number.isFinite(milliseconds) && milliseconds >= 0 ? `${milliseconds} ms` : '—';
  }

  private formatCount(value: unknown): string {
    const count = Number(value);
    return Number.isFinite(count) ? String(count) : '0';
  }

  private loadFlowMessages(): void {
    if (!this.flow?.id || this.destroyed) {
      return;
    }
    this.subscriptions.add(
      this.flowService.getFlowMessages(this.flow.id).subscribe({
        next: response => {
          if (this.destroyed || !this.ran) {
            return;
          }
          const body = response.body;
          this.completedCount = body?.completedTransactions ?? null;
          this.failedCount = body?.failedTransactions ?? null;
          this.changeDetector.detectChanges();
        },
      }),
    );
  }

  flowConfigurationNotObtained(id) {
    this.isFlowStatusOK = false;
    this.flowStatusError = `Configuration for flow with id=${id} is not obtained.`;
  }

  getSteps() {
    this.steps.forEach(step => {
      if (step.stepType.valueOf() === 'FROM') {
        this.fromStep.push(step);
        this.fromStepTooltips.push(this.stepTooltip(step.componentType, step.uri, step.options));
      } else if (step.stepType.valueOf() === 'TO') {
        this.toSteps.push(step);
        this.toStepsTooltips.push(this.stepTooltip(step.componentType, step.uri, step.options));
      } else if (step.stepType.valueOf() === 'ERROR') {
        this.errorStep = step;
        this.errorStepTooltip = this.stepTooltip(step.componentType, step.uri, step.options);
      } else if (step.stepType.valueOf() === 'RESPONSE') {
        this.responseSteps.push(step);
        this.responseStepTooltips.push(this.stepTooltip(step.componentType, step.uri, step.options));
      }
    });
  }

  getSSLUrl(type: String, uri: String, options: String) {
    let hostname;

    switch (type) {
      case 'FTPS':
        if (uri.includes('@')) {
          uri = uri.substring(uri.indexOf('@') + 1);
        }
        hostname = new URL('https://' + uri).hostname;
        this.sslUrl = 'https://' + hostname;
        break;
      case 'HTTPS':
        hostname = new URL('https://' + uri).hostname;
        this.sslUrl = 'https://' + hostname;
        break;
      case 'IMAPS':
        if (uri.includes('@')) {
          uri = uri.substring(uri.indexOf('@') + 1);
        }
        hostname = new URL('https://' + uri).hostname;
        this.sslUrl = 'https://' + hostname;
        break;
      case 'KAFKA':
        if (options.includes(',')) {
          options = options.substring(options.lastIndexOf('brokers=') + 1, options.lastIndexOf(','));
        } else {
          options = options.substring(uri.indexOf(',') + 1);
        }
        hostname = new URL('https://' + options).hostname;
        this.sslUrl = 'https://' + hostname;
        break;
      case 'NETTY4':
        hostname = new URL('https://' + uri).hostname;
        this.sslUrl = 'https://' + hostname;
        break;
      case 'SMTPS':
        if (uri.includes('@')) {
          uri = uri.substring(uri.indexOf('@') + 1);
        }
        hostname = new URL('https://' + uri).hostname;
        this.sslUrl = 'https://' + hostname;
        break;
      default:
        this.sslUrl = `0`;
        break;
    }

    return this.sslUrl;
  }

  stepTooltip(type, uri, options): string {
    if (type === null) {
      return '';
    } else {
      const opt = options === '' ? '' : `?${options}`;
      return `${type.toLowerCase()}://${uri}${opt}`;
    }
  }

  curentDateTime(): string {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  }

  registerTriggeredAction() {
    this.subscriptions.add(this.eventManager.subscribe('trigerAction', (response: EventWithContent<unknown>) => {
      switch (response.content as string) {
        case 'start':
          if (this.statusFlow === Status.inactive && !this.isDraft) {
            this.start();
          }
          break;
        case 'stop':
          if (this.statusFlow === Status.active || this.statusFlow === Status.paused) {
            this.stop();
          }
          break;
        case 'pause':
          if (this.statusFlow === Status.active) {
            this.pause();
          }
          break;
        case 'restart':
          if (this.statusFlow === Status.active) {
            this.restart();
          }
          break;
        case 'resume':
          if (this.statusFlow === Status.paused) {
            this.resume();
          }
          break;
        default:
          break;
      }
    }));
  }

  start() {

    this.flowStatus = 'Starting';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;
    this.failure = null;

    if(this.flow.logLevel === LogLevelType.TRACE){
      this.enableTracing();
    }

    this.configureAndRun(
      this.flowService.start(this.flow.id),
      body => {
        this.applyAnswer(body);
      },
      err => {
        this.statusMessage = err.error;
        this.disableActionBtns = false;
        this.setFlowStatus('error');
        this.flowStatusError = `Flow with id=${this.flow.id} is not started.`;
        this.isFlowStatusOK = false;
      },
      () => {
        this.flowStatusError = `Flow with id=${this.flow.id} is not started.`;
        this.flowConfigurationNotObtained(this.flow.id);
        this.isFlowStatusOK = false;
        this.disableActionBtns = false;
      },
    );
  }

  pause() {
    this.flowStatus = 'Pausing';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;
    this.subscriptions.add(
      this.flowService.pause(this.flow.id).subscribe(
        response => {
          if (this.destroyed) {
            return;
          }
          this.applyAnswer(response.body);
        },
        err => {
          if (this.destroyed) {
            return;
          }
          this.statusMessage = err.error;
          this.disableActionBtns = false;
          this.setFlowStatus('error');
          this.isFlowStatusOK = false;
          this.flowStatusError = `Flow with id=${this.flow.id} is not paused`;
        },
      ),
    );
  }

  resume() {
    this.flowStatus = 'Resuming';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;

    this.configureAndRun(
      this.flowService.resume(this.flow.id),
      body => {
        this.applyAnswer(body);
      },
      err => {
        this.statusMessage = err.error;
        this.disableActionBtns = false;
        this.setFlowStatus('error');
        this.isFlowStatusOK = false;
        this.flowStatusError = `Flow with id=${this.flow.id} is not resumed.`;
      },
      () => {
        this.flowConfigurationNotObtained(this.flow.id);
        this.disableActionBtns = false;
      },
    );
  }

  restart() {
    this.flowStatus = 'Restarting';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;
    this.flowAlerts = `false`;

    if(this.flow.logLevel === LogLevelType.OFF){
      this.disableTracing();
    }

    this.configureAndRun(
      this.flowService.restart(this.flow.id),
      body => {
        this.applyAnswer(body);
      },
      err => {
        this.statusMessage = err.error;
        this.disableActionBtns = false;
        this.setFlowStatus('error');
        this.isFlowStatusOK = false;
        this.flowStatusError = `Flow with id=${this.flow.id} is not started.`;
      },
      () => {
        this.flowConfigurationNotObtained(this.flow.id);
        this.disableActionBtns = false;
      },
    );
  }

  stop() {
    this.flowStatus = 'Stopping';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;

    this.disableTracing();

    this.subscriptions.add(
      this.flowService.stop(this.flow.id).subscribe(
        response => {
          if (this.destroyed) {
            return;
          }
          this.applyAnswer(response.body);
        },
        err => {
          if (this.destroyed) {
            return;
          }
          this.statusMessage = err.error;
          this.disableActionBtns = false;
          this.setFlowStatus('error');
          this.isFlowStatusOK = false;
          this.flowStatusError = `Flow with id=${this.flow.id} is not stopped.`;
        },
      ),
    );
  }

  /** Shows what the runtime answered: the Flow's new status, or Error when the answer reports a failure. */
  private applyAnswer(body: string): void {
    this.statusMessage = body;
    this.disableActionBtns = false;
    this.setFlowStatus(flowFailureOf(body) ? 'error' : (flowEventOf(body) ?? ''));
  }

  private configureAndRun(
    action: Observable<HttpResponse<string>>,
    onSuccess: (body: string) => void,
    onActionError: (err: { error?: string }) => void,
    onConfigureError: () => void,
  ): void {
    let configured = false;
    this.subscriptions.add(
      this.flowService
        .getConfiguration(this.flow.id)
        .pipe(
          switchMap(data => this.flowService.setConfiguration(this.flow.id, data.body, 'true')),
          tap(() => {
            configured = true;
          }),
          switchMap(() => action),
        )
        .subscribe({
          next: response => {
            if (!this.destroyed) {
              onSuccess(response.body);
            }
          },
          error: err => {
            if (this.destroyed) {
              return;
            }
            if (configured) {
              onActionError(err);
            } else {
              onConfigureError();
              this.statusMessage = err.error;
              this.setFlowStatus('error');
            }
          },
        }),
    );
  }

  enableTracing(){

      const collector = this.collectors.tracing;
      const sourceStep = this.steps.find(step => step.stepType === 'SOURCE');
      const sinkStep = this.steps.find(step => step.stepType === 'SINK');
      const sourceStepId = this.flow.id.toString() + '-' + sourceStep.id.toString();
      const sinkStepId = this.flow.id.toString() + '-' + sinkStep.id.toString();

      const filters: Array<any> = [];
      filters.push(new Filter(sourceStepId,sourceStepId));
      filters.push(new Filter(sinkStepId,sinkStepId));

      collector.id = this.flow.id.toString();
      collector.filters = filters;

      this.integrationService.addCollector(collector.id,collector).subscribe(
        response => {
          //console.log('ok configured' + JSON.stringify(response));
        },
        err => {
          console.log('Failed to configure tracing: ' + err);
        }
      );

  }

  disableTracing(){

   this.integrationService.removeCollector(this.flow.id).subscribe(
        response => {},
        err => {
          console.log('Failed to remove tracing: ' + JSON.stringify(err));
        }
      );

  }

}

export class Filter {
  id: string;
  filter: string;

    constructor(id: string, filter: string) {
      this.id = id;
      this.filter = filter;
    }
}
