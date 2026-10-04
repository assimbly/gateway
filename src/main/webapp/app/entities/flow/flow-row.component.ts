import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Flow, IFlow, LogLevelType } from 'app/shared/model/flow.model';
import { isDraft, loadFlowGraph, opensOnCanvas } from './designer/flow-graph';
import { FlowService } from './flow.service';
import { FlowDeleteDialogComponent } from 'app/entities/flow/flow-delete-dialog.component';

import { Step, StepType } from 'app/shared/model/step.model';
import { StepService } from '../step/step.service';
import { IntegrationService } from '../integration/integration.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { Collectors } from 'app/shared/collect/collectors';
import { OverflowActionDirective, PrimaryActionDirective, RowActions, StatusControls, StatusControlsTone, Truncate } from 'app/shared/table';
import { FlowRowAlerts } from './flow-row-alerts.component';
import { FlowRowStats, FlowStatsSection } from './flow-row-stats.component';
import { FlowAction, RowStatus, countLabel, flowTypeLabel, hasRun, rowStatus } from './flow-row-status';
import { FlowStatusPillComponent } from './flow-status-pill.component';

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
    RowActions,
    PrimaryActionDirective,
    OverflowActionDirective,
    StatusControls,
    Truncate,
    FlowRowAlerts,
    FlowRowStats,
    FlowStatusPillComponent,
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

  public flowError = false;
  public flowErrorButton: string;

  public flowAlerts: string;
  public numberOfAlerts: any;
  public alertMessages: string[] = [];
  public alertsTotal = 0;
  public alertsLoading = false;
  public alertsLoadingMore = false;
  private readonly alertPageSize = 10;
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

  get statusTone(): StatusControlsTone {
    switch (this.statusFlow) {
      case Status.active:
        return 'started';
      case Status.paused:
        return 'paused';
      case Status.inactiveError:
        return 'failed';
      default:
        return 'default';
    }
  }

  readonly menuLabels: Record<FlowAction, string> = { start: 'Start', stop: 'Stop', pause: 'Pause', resume: 'Resume', restart: 'Restart' };
  readonly menuIcons: Record<FlowAction, IconProp> = { start: 'play', stop: 'stop', pause: 'pause', resume: 'step-forward', restart: 'sync' };

  get state(): RowStatus {
    return rowStatus(this.statusFlow, this.isDraft);
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
    this.isDraft = opensOnCanvas(this.flow.type) && isDraft(loadFlowGraph(this.flow));

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

  onAlertsOpen(): void {
    this.alertMessages = [];
    this.alertsTotal = 0;
    this.alertsLoading = true;
    this.alertsLoadingMore = false;
    this.loadAlertPage();
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
        const lastStatus = this.flowStatus;
        this.statusFlow = Status.inactiveError;
        this.isFlowStarted = this.isFlowPaused = false;
        this.flowStatusButton = `Failed`;
        this.setErrorMessage(lastStatus,this.statusMessage);
        break;
      default:
        const unknownStatus = this.flowStatus;
        this.statusFlow = Status.inactive;
        this.isFlowStarted = this.isFlowPaused = false;
        this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
        this.flowStatusButton = `Unknown`;
        this.setErrorMessage(unknownStatus,this.statusMessage);
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

  setErrorMessage(action: string, errorReport: any){

      this.flowError = true;

      try {

          if (errorReport.flow.installed) {

                  const total = errorReport.flow.installed.total;
                  const failed = errorReport.flow.installed.failed;

                  this.flowErrorButton = `${failed} of ${total} steps failed to start <br/><br/>
                                           <b>Details:</b> <br/>`;

                  for (let i = 0; i < errorReport.flow.steps.length; i++) {

                      const uri = errorReport.flow.steps[i].uri;
                      const status = errorReport.flow.steps[i].status;

                      if(status==='error' && uri){

                          const errorMessage = errorReport.flow.steps[i].message;

                          this.flowErrorButton = this.flowErrorButton + `<br/><table class="table" style="width: 100%">
                            <tbody>
                              <tr>
                                <td><b>uri:</b></td>
                                <td>${uri}</td>
                              </tr>
                              <tr>
                                <td><b>error:</b></td>
                                <td>${errorMessage}</td>
                              </tr>
                            </tbody>
                          </table>`;
                      }else if(status==='error'){

                          const errorMessage = errorReport.flow.steps[i].message;

                          this.flowErrorButton = this.flowErrorButton + `<br/><table class="table">
                            <tbody>
                              <tr>
                                <td><b>error:</b></td>
                                <td>${errorMessage}</td>
                              </tr>
                            </tbody>
                          </table>`;
                      }

                  }

          } else {
              this.flowErrorButton = errorReport.flow.message;
          }
      } catch (e) {
           this.flowErrorButton = errorReport;
      }

  }

  getFlowAlertsPoll(): void {
    if (this.destroyed) {
      return;
    }
    this.getFlowNumberOfAlerts(this.flow.id);
  }

  onAlertsScroll(event: Event): void {
    if (this.alertsLoading || this.alertsLoadingMore || this.alertMessages.length >= this.alertsTotal) {
      return;
    }
    const element = event.target as HTMLElement;
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (distanceFromBottom <= 48) {
      this.alertsLoadingMore = true;
      this.loadAlertPage();
    }
  }

  private loadMoreAlertsIfNeeded(): void {
    if (this.alertsLoading || this.alertsLoadingMore || this.alertMessages.length >= this.alertsTotal) {
      return;
    }
    const list = document.querySelector('.flow-alert-list') as HTMLElement | null;
    if (list && list.scrollHeight <= list.clientHeight + 1) {
      this.alertsLoadingMore = true;
      this.loadAlertPage();
    }
  }

  private loadAlertPage(): void {
    const offset = this.alertMessages.length;
    this.subscriptions.add(
      this.flowService.getFlowAlertsPage(this.flow.id, offset, this.alertPageSize).subscribe({
        next: response => {
          if (this.destroyed) {
            return;
          }
          const page = response.body;
          this.alertsTotal = page?.total ?? 0;
          this.alertMessages = this.alertMessages.concat(page?.messages ?? []);
          this.alertsLoading = false;
          this.alertsLoadingMore = false;
          this.setFlowNumberOfAlerts(this.alertsTotal);
          this.changeDetector.detectChanges();
          setTimeout(() => this.loadMoreAlertsIfNeeded());
        },
        error: () => {
          if (this.destroyed) {
            return;
          }
          this.alertsLoading = false;
          this.alertsLoadingMore = false;
          this.changeDetector.detectChanges();
        },
      }),
    );
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
    this.flowError = false;

    if(this.flow.logLevel === LogLevelType.TRACE){
      this.enableTracing();
    }

    this.configureAndRun(
      this.flowService.start(this.flow.id),
      body => {
        this.statusMessage = JSON.parse(body);
        this.disableActionBtns = false;
        this.setFlowStatus(this.statusMessage.flow.event);
      },
      err => {
        this.statusMessage = JSON.parse(err.error);
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
          this.statusMessage = JSON.parse(response.body);
          this.disableActionBtns = false;
          this.setFlowStatus(this.statusMessage.flow.event);
        },
        err => {
          if (this.destroyed) {
            return;
          }
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
        this.statusMessage = JSON.parse(body);
        this.disableActionBtns = false;
        this.setFlowStatus(this.statusMessage.flow.event);
      },
      err => {
        this.statusMessage = JSON.parse(err.error);
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
        this.statusMessage = JSON.parse(body);
        this.disableActionBtns = false;
        this.setFlowStatus(this.statusMessage.flow.event);
      },
      err => {
        this.statusMessage = JSON.parse(err.error);
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
          this.statusMessage = JSON.parse(response.body);
          this.disableActionBtns = false;
          this.setFlowStatus(this.statusMessage.flow.event);
        },
        err => {
          if (this.destroyed) {
            return;
          }
          this.disableActionBtns = false;
          this.setFlowStatus('error');
          this.isFlowStatusOK = false;
          this.flowStatusError = `Flow with id=${this.flow.id} is not stopped.`;
        },
      ),
    );
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
