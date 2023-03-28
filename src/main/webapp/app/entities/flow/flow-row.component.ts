import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Flow, IFlow, LogLevelType } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { FlowDeleteDialogComponent } from 'app/entities/flow/flow-delete-dialog.component';

import { Step, StepType } from 'app/shared/model/step.model';
import { StepService } from '../step/step.service';
import { IntegrationService } from "../integration/integration.service";
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { Collectors } from 'app/shared/collect/collectors';

import { NavigationEnd, Router } from '@angular/router';
import dayjs from 'dayjs/esm';

import { forkJoin, Observable, Observer, Subscription, ReplaySubject, Subject } from 'rxjs';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { WebSocketsService } from 'app/shared/websockets/websockets.service';
import Stomp, { Client, Subscription as StompSubscription, ConnectionHeaders, Message } from 'webstomp-client';

enum Status {
  active = 'active',
  paused = 'paused',
  inactive = 'inactive',
  inactiveError = 'inactiveError',
}
@Component({
  selector: '[jhi-flow-row]',
  templateUrl: './flow-row.component.html',
})
export class FlowRowComponent implements OnInit, OnDestroy {
  sslUrl: any;
  mySubscription: Subscription;

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

  public flowDetails: string;
  public flowStatus: string;
  public flowStatusError: string;
  public isFlowStatusOK: boolean;
  public flowStatistic: string;
  public flowStatusButton: string;
  public flowStartTime: any;
  public clickButton = false;

  public flowAlerts: string;
  public flowAlertsButton: string;
  public numberOfAlerts: any;
  public showNumberOfItems: number;

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

  statsTableRows: Array<string> = [];

  intervalTime: any;

  stompClient = null;
  subscriber = null;

  connectionSubject: ReplaySubject<void> = new ReplaySubject(1);
  connectionEventSubscription: Subscription | null = null;
  connectionAlertSubscription: Subscription | null = null;
  stompSubscription: StompSubscription | null = null;

  connection: Promise<any>;
  connectedPromise: any;
  private listenerSubject: Subject<string> = new Subject();
  listener: Observable<any>;
  listenerObserver: Observer<any>;

  alreadyConnectedOnce = false;
  private subscription: Subscription;

  modalRef: NgbModalRef | null;

  constructor(
    private flowService: FlowService,
    private stepService: StepService,
		private integrationService: IntegrationService,
    private modalService: NgbModal,
    private router: Router,
    private eventManager: EventManager,
	  private webSocketsService: WebSocketsService,
	  private collectors: Collectors
  ) {

    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.mySubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
      }
    });
  }

  ngOnInit() {
    this.setFlowStatusDefaults();
    this.getStatus(this.flow.id);
    this.steps = this.flow.steps;
    this.getSteps();

    this.registerTriggeredAction();

    this.stompClient = this.webSocketsService.getClient();
	  this.connectionSubject = this.webSocketsService.getConnectionSubject();

	  this.subscribeToEvent(this.flow.id,'event');

    this.subscribeToAlert(this.flow.id,'alert');

  }

  ngAfterViewInit() {

    this.subscription = this.receive().subscribe(data => {

			if (data.startsWith('alert')) {
        const data2  = data.split(':');
        const alertId = Number(data2[1]);
        if (this.flow.id === alertId) {
          this.getFlowNumberOfAlerts(alertId);
        }

			} else {
        const response = JSON.parse(data);
			  this.statusMessage = response;
			  if(response.flow.message.startsWith('Failed')){
			    this.setFlowStatus('error');
			  }else{
			    this.setFlowStatus(response.flow.event);
			  }

			}

    });

  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  getStatus(id: number) {
    this.clickButton = true;

    forkJoin(this.flowService.getFlowStatus(id), this.flowService.getFlowNumberOfAlerts(id)).subscribe(([flowStatus, flowAlertsNumber]) => {
      if (flowStatus.body != 'unconfigured') {
        this.setFlowStatus(flowStatus.body);
      }
      this.setFlowNumberOfAlerts(flowAlertsNumber.body);
    });
  }

  setFlowStatusDefaults() {
    this.isFlowStatusOK = true;
    this.flowStatus = 'unconfigured';
    this.lastError = '';
    this.setFlowStatus(this.flowStatus);
  }

  getFlowStatus(id: number) {
    this.clickButton = true;
    this.flowService.getFlowStatus(id).subscribe(response => {
      this.setFlowStatus(response.body);
    });
  }

  setFlowStatus(status: string): void {

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

        break;
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
      default:
        const lastStatus = this.flowStatus;
        this.statusFlow = Status.inactiveError;
        this.setErrorMessage(lastStatus,this.statusMessage);
        break;
    }
  }

  setErrorMessage(action: string, error: string){

      try {

          if (this.statusMessage.flow.stepsLoaded) {

                  const total = this.statusMessage.flow.stepsLoaded.total;
                  const failed = this.statusMessage.flow.stepsLoaded.failed;

                  this.flowStatusButton = `<b>Last action:</b> ${action} <br/>
                                           <b>Status:</b> ${failed} of ${total} steps failed to start <br/><br/>
                                           <b>Details:</b> <br/>`;

                  console.log('this.flowStatusButton=' + this.flowStatusButton);


                  for (let i = 0; i < this.statusMessage.flow.steps.length; i++) {

                      const id = this.statusMessage.flow.steps[i].id;
                      const uri = this.statusMessage.flow.steps[i].uri;
                      const status = this.statusMessage.flow.steps[i].status;

                      if(status==='error' && uri){

                          const errorMessage = this.statusMessage.flow.steps[i].errorMessage;

                          this.flowStatusButton = this.flowStatusButton + `<br/><table class="table ">
                            <tbody>
                              <tr>
                                <td><b>step id:</b></td>
                                <td>${id}</td>
                              </tr>
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
                          const errorMessage = this.statusMessage.flow.steps[i].errorMessage;

                          this.flowStatusButton = this.flowStatusButton + `<br/><table class="table ">
                            <tbody>
                              <tr>
                                <td><b>step id:</b></td>
                                <td>${id}</td>
                              </tr>
                              <tr>
                                <td><b>error:</b></td>
                                <td>${errorMessage}</td>
                              </tr>
                            </tbody>
                          </table>`;
                      }

                  }

          } else {
              this.flowStatusButton = this.statusMessage.flow.message;
          }
      } catch (e) {
           this.flowStatusButton = error;
      }

  }

  getFlowAlerts(id: number) {
    this.clickButton = true;
    this.flowService.getFlowAlerts(id).subscribe(response => {
      this.setFlowAlerts(response.body);
    });
  }

  setFlowAlerts(flowAlertsItems: string): void {
    if (flowAlertsItems !== null) {
      let alertStartItem;
      let alertEndItem;

	  const flowAlertsList = flowAlertsItems.split(',');
      if (flowAlertsList.length < 4) {
        this.showNumberOfItems = flowAlertsList.length;
        alertStartItem = flowAlertsList.length - 1;
        alertEndItem = 0;
      } else {
        this.showNumberOfItems = 3;
        alertStartItem = flowAlertsList.length - 1;
        alertEndItem = flowAlertsList.length - 3;
      }

      let i;
      let alertItems = '';
      for (i = alertStartItem; i >= alertEndItem; i--) {
        alertItems += `<a class="list-group-item"><h5 class="mb-1">` + flowAlertsList[i] + `</h5></a>`;
      }

      this.flowAlertsButton = `<div class="list-group">` + alertItems + `</div>`;
    } else {
      this.flowAlertsButton = `Can't retrieve alert details`;
    }
  }

  getFlowNumberOfAlerts(id: number) {
    this.clickButton = true;

    this.flowService.getFlowNumberOfAlerts(id).subscribe(response => {
      this.setFlowNumberOfAlerts(response.body);
    });
  }

  setFlowNumberOfAlerts(numberOfAlerts: string): void {
    let numberOfAlerts2 = parseInt(numberOfAlerts, 10);
    if (numberOfAlerts2 === 0) {
      this.flowAlerts = `false`;
      this.numberOfAlerts = `0`;
      this.showNumberOfItems = 3;
    } else {
      this.flowAlerts = `true`;
      this.numberOfAlerts = numberOfAlerts;
      if (numberOfAlerts2 < 4) {
        this.showNumberOfItems = numberOfAlerts.length;
      } else {
        this.showNumberOfItems = 3;
      }
    }
  }

  navigateToFlowEditor(mode: string) {

    console.log('type=' + this.flow.type);
    if(!this.flow.type){
      this.flow.type = 'flow';
    }

    switch (mode) {
        case 'edit':
          this.router.navigate(['../../flow/editor', this.flow.id, { mode: mode, editor: this.flow.type }]);
          break;
        case 'clone':
          this.router.navigate(['../../flow/editor', this.flow.id, { mode: mode, editor: this.flow.type }]);
          break;
        case 'delete':
          let modalRef = this.modalService.open(FlowDeleteDialogComponent as any);
          if (typeof FlowDeleteDialogComponent as Component) {
            modalRef.componentInstance.flow = this.flow;
            modalRef.result.then(
              result => {
                this.eventManager.broadcast({ name: 'flowDeleted', content: this.flow });
                modalRef = null;
              },
              reason => {
                this.eventManager.broadcast({ name: 'flowDeleted', content: this.flow });
                modalRef = null;
              }
            );
          }
          break;
        default:
          break;
      }
  }

  navigateToStepEditor(mode: string, editorType: string, step: Step) {
    this.router.navigate(['../../flow/editor', this.flow.id, { mode: mode, editor: editorType, stepid: step.id }]);
  }

  exportFlow(){
    this.flowService.exportFlowConfiguration(this.flow);
  }

  getFlowLastError(id: number, action: string, errMessage: string) {

    if (errMessage) {
      if (errMessage.startsWith('Full authentication is required to access this resource', 0)) {
        this.router.navigate(['/login']);
      } else {
        this.setErrorMessage(action, errMessage);
        this.statusFlow = Status.inactiveError;
      }
    } else {
      this.flowService.getFlowLastError(id).subscribe(response => {
        this.lastError = response === '0' ? '' : response.body;
        this.setErrorMessage(action, errMessage);
        this.statusFlow = Status.inactiveError;
      });
    }

  }

  getFlowStats(flow: IFlow) {

    this.startGetFlowStats(flow);

    // refresh every 5 seconds
    this.intervalTime = setInterval(() => {
      this.startGetFlowStats(flow);
    }, 5000);
  }

  startGetFlowStats(flow: IFlow) {
    this.flowStatistic = ``;
    this.statsTableRows = [];

    for (const step of flow.steps) {

      if (step.stepType === StepType.FROM || step.stepType === StepType.SOURCE) {
        this.flowService.getFlowStats(flow.id, step.id, flow.integrationId).subscribe(res => {
          this.setFlowStatistic(res.body, step.componentType.toString() + '://' + step.uri);
        });
      }else if(step.stepType === StepType.SCRIPT || step.stepType === StepType.ROUTE ){
        this.flowService.getFlowStats(flow.id, step.id, flow.integrationId).subscribe(res => {
          this.setFlowStatistic(res.body, flow.id + '-' + step.id);
        });

      }
    }
  }

  stopGetFlowStats() {
    clearInterval(this.intervalTime);
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
                <b>Autostart:</b> ${this.flow.autoStart}<br/>
                <b>Tracing:</b> ${this.flow.logLevel}<br/>

        `;
  }

  setFlowStatistic(res, uri) {
          /* Example of available stats
          *
          * "maxProcessingTime": 1381,
            "lastProcessingTime": 1146,
            "meanProcessingTime": 1262,
            "lastExchangeFailureExchangeId": "",
            "firstExchangeFailureTimestamp": "1970-01-01T00:59:59.999+0100",
            "firstExchangeCompletedExchangeId": "ID-win81-1553585873482-0-1",
            "lastExchangeCompletedTimestamp": "2019-03-26T08:44:04.510+0100",
            "exchangesCompleted": 3,
            "deltaProcessingTime": -114,
            "firstExchangeCompletedTimestamp": "2019-03-26T08:44:01.955+0100",
            "externalRedeliveries": 0,
            "firstExchangeFailureExchangeId": "",
            "lastExchangeCompletedExchangeId": "ID-win81-1553585873482-0-9",
            "lastExchangeFailureTimestamp": "1970-01-01T00:59:59.999+0100",
            "exchangesFailed": 0,
            "redeliveries": 0,
            "minProcessingTime": 1146,
            "resetTimestamp": "2019-03-26T08:43:59.201+0100",
            "failuresHandled": 3,
            "totalProcessingTime": 3787,
            "startTimestamp": "2019-03-26T08:43:59.201+0100"
         */

    if (res.step.status != 'started') {
      this.flowStatistic = `Currently there are no statistics for this flow.`;
    } else {
      const now = dayjs();
      const start = dayjs(res.step.stats.startTimestamp);
      const flowRuningTime = dayjs.duration(now.diff(start));
      const hours = Math.floor(flowRuningTime.asHours());
      const minutes = flowRuningTime.minutes();
      const completed = res.step.stats.exchangesCompleted - res.step.stats.failuresHandled;
      const failures = res.step.stats.exchangesFailed + res.step.stats.failuresHandled;
      let processingTime = ``;

      if (this.statsTableRows.length === 0) {
        this.statsTableRows[0] = `<td>${uri}</td>`;
        this.statsTableRows[1] = `<td>${this.checkDate(res.step.stats.startTimestamp)}</td>`;
        this.statsTableRows[2] = `<td>${hours} hours ${minutes} ${minutes > 1 ? 'minutes' : 'minute'}</td>`;
        this.statsTableRows[3] = `<td>${this.checkDate(res.step.stats.firstExchangeCompletedTimestamp)}</td>`;
        this.statsTableRows[4] = `<td>${this.checkDate(res.step.stats.lastExchangeCompletedTimestamp)}</td>`;
        this.statsTableRows[5] = `<td>${completed}</td>`;
        this.statsTableRows[6] = `<td>${failures}</td>`;
        this.statsTableRows[7] = `<td>${res.step.stats.minProcessingTime} ms</td>`;
        this.statsTableRows[8] = `<td>${res.step.stats.maxProcessingTime} ms</td>`;
        this.statsTableRows[9] = `<td>${res.step.stats.meanProcessingTime} ms</td>`;
      } else {
        this.statsTableRows[0] = this.statsTableRows[0] + `<td>${uri}</td>`;
        this.statsTableRows[1] = this.statsTableRows[1] + `<td>${this.checkDate(res.step.stats.startTimestamp)}</td>`;
        this.statsTableRows[2] = this.statsTableRows[2] + `<td>${hours} hours ${minutes} ${minutes > 1 ? 'minutes' : 'minute'}</td>`;
        this.statsTableRows[3] = this.statsTableRows[3] + `<td>${this.checkDate(res.step.stats.firstExchangeCompletedTimestamp)}</td>`;
        this.statsTableRows[4] = this.statsTableRows[4] + `<td>${this.checkDate(res.step.stats.lastExchangeCompletedTimestamp)}</td>`;
        this.statsTableRows[5] = this.statsTableRows[5] + `<td>${completed}</td>`;
        this.statsTableRows[6] = this.statsTableRows[6] + `<td>${failures}</td>`;
        this.statsTableRows[7] = this.statsTableRows[7] + `<td>${res.step.stats.minProcessingTime} ms</td>`;
        this.statsTableRows[8] = this.statsTableRows[8] + `<td>${res.step.stats.maxProcessingTime} ms</td>`;
        this.statsTableRows[9] = this.statsTableRows[9] + `<td>${res.step.stats.meanProcessingTime} ms</td>`;
      }

      if (res.step.stats.lastProcessingTime > 0) {
        processingTime = `<tr>
			      <th scope="row">Min</th>
			      ${this.statsTableRows[7]}
			    </tr>
			    <tr>
			      <th scope="row">Max</th>
			      ${this.statsTableRows[8]}
			    </tr>
			    <tr>
			      <th scope="row">Average</th>
			      ${this.statsTableRows[9]}
			    </tr>`;
      }

      this.flowStatistic =
        `
            <div class="col-12">
			<table class="table">
			  <tbody>
                 <tr>
                    <th scope="row">Step</th>
                    ${this.statsTableRows[0]}
                </tr>
			    <tr>
			      <th scope="row">Start time</th>
                    ${this.statsTableRows[1]}
			    </tr>
			    <tr>
			      <th scope="row">Running</th>
                    ${this.statsTableRows[2]}
			    </tr>
			    <tr>
			      <th scope="row">First Message</th>
                    ${this.statsTableRows[3]}
			    </tr>
			    <tr>
			      <th scope="row">Last Message</th>
			       ${this.statsTableRows[4]}
			    </tr>` +
        processingTime +
        `
			    <tr>
			      <th scope="row">Completed</th>
                  ${this.statsTableRows[5]}
			    </tr>
			    <tr>
			      <th scope="row">Failed</th>
                  ${this.statsTableRows[6]}
			    </tr>
               </tbody>
			</table>
			<div>
        `;
    }
  }

  checkDate(r) {
    if (r) {
      return dayjs(r).format('YYYY-MM-DD HH:mm:ss');
    } else {
      return '-';
    }
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
    this.eventManager.subscribe('trigerAction', response => {
      switch (response) {
        case 'start':
          if (this.statusFlow === Status.inactive) {
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
    });
  }

  start() {
    this.flowStatus = 'Starting';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;

    if(this.flow.logLevel === LogLevelType.TRACE){
      this.enableTracing();
    }

    this.flowService.getConfiguration(this.flow.id).subscribe(
      data => {
        this.flowService.setConfiguration(this.flow.id, data.body, 'true').subscribe(data2 => {
          this.flowService.start(this.flow.id).subscribe(
            response => {
              if (response.status === 200) {
                // below is only used for tested (by default websockets is used)
                // this.setFlowStatus('started');
              }
              this.disableActionBtns = false;
            },
            err => {
              this.getFlowLastError(this.flow.id, 'Start', err.error);
              this.isFlowStatusOK = false;
              this.flowStatusError = `Flow with id=${this.flow.id} is not started.`;
              this.disableActionBtns = false;
            }
          );
        });
      },
      err => {
        this.getFlowLastError(this.flow.id, 'Start', err.error);
        this.isFlowStatusOK = false;
        this.flowStatusError = `Flow with id=${this.flow.id} is not started.`;
        this.flowConfigurationNotObtained(this.flow.id);
        this.disableActionBtns = false;
      }
    );
  }

  pause() {
    this.flowStatus = 'Pausing';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;
    this.flowService.pause(this.flow.id).subscribe(
      response => {
        if (response.status === 200) {
          // this.setFlowStatus('suspended');
        }
        this.disableActionBtns = false;
      },
      err => {
        this.getFlowLastError(this.flow.id, 'Pause', err.error);
        this.isFlowStatusOK = false;
        this.flowStatusError = `Flow with id=${this.flow.id} is not paused.`;
        this.disableActionBtns = false;
      }
    );
  }

  resume() {
    this.flowStatus = 'Resuming';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;

    this.flowService.getConfiguration(this.flow.id).subscribe(
      data => {
        this.flowService.setConfiguration(this.flow.id, data.body, 'true').subscribe(data2 => {
          this.flowService.resume(this.flow.id).subscribe(
            response => {
              if (response.status === 200) {
                // this.setFlowStatus('resumed');
              }
              this.disableActionBtns = false;
            },
            err => {
              this.getFlowLastError(this.flow.id, 'Resume', err.error);
              this.isFlowStatusOK = false;
              this.flowStatusError = `Flow with id=${this.flow.id} is not resumed.`;
              this.disableActionBtns = false;
            }
          );
        });
      },
      err => {
        this.flowConfigurationNotObtained(this.flow.id);
        this.disableActionBtns = false;
      }
    );
  }

  restart() {
    this.flowStatus = 'Restarting';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;

    if(this.flow.logLevel === LogLevelType.OFF){
      this.disableTracing();
    }

    this.flowService.getConfiguration(this.flow.id).subscribe(
      data => {
        this.flowService.setConfiguration(this.flow.id, data.body, 'true').subscribe(data2 => {
          this.flowService.restart(this.flow.id).subscribe(
            response => {
              if (response.status === 200) {
                // this.setFlowStatus('restarted');
              }
              this.disableActionBtns = false;
            },
            err => {
              this.getFlowLastError(this.flow.id, 'Restart', err.error);
              this.isFlowStatusOK = false;
              this.flowStatusError = `Flow with id=${this.flow.id} is not restarted.`;
              this.disableActionBtns = false;
            }
          );
        });
      },
      err => {
        this.flowConfigurationNotObtained(this.flow.id);
        this.disableActionBtns = false;
      }
    );
  }

  stop() {
    this.flowStatus = 'Stopping';
    this.isFlowStatusOK = true;
    this.disableActionBtns = true;

    this.disableTracing();

    this.flowService.stop(this.flow.id).subscribe(
      response => {
        if (response.status === 200) {
          // this.setFlowStatus('stopped');
        }
        this.disableActionBtns = false;
      },
      err => {
        this.getFlowLastError(this.flow.id, 'Stop', err.error);
        this.isFlowStatusOK = false;
        this.flowStatusError = `Flow with id=${this.flow.id} is not stopped.`;
        this.disableActionBtns = false;
      }
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

      this.integrationService.addCollector('1',collector.id,collector).subscribe(
        response => {
          //console.log('ok configured' + JSON.stringify(response));
        },
        err => {
          console.log('Failed to configure tracing: ' + err);
        }
      );

  }

  disableTracing(){

   this.integrationService.removeCollector('1',this.flow.id).subscribe(
        response => {
          //console.log('2. Removed' + response);
        },
        err => {
          console.log('Failed to remove tracing: ' + JSON.stringify(err));
        }
      );

  }

  receive(): Subject<string> {
    return this.listenerSubject;
  }

  subscribeToEvent(id, type): void {

    if (this.connectionEventSubscription) {
      return;
    }


	const topic = '/topic/' + id + '/' + type;

    this.connectionEventSubscription = this.connectionSubject.subscribe(() => {

      if (this.stompClient) {

        this.stompSubscription = this.stompClient.subscribe(topic, (data: Message) => {
          this.listenerSubject.next(data.body);
        });
      }
    });
  }

   subscribeToAlert(id, type): void {

    if (this.connectionAlertSubscription) {
      return;
    }


	const topic = '/topic/' + id + '/' + type;

    this.connectionAlertSubscription = this.connectionSubject.subscribe(() => {

      if (this.stompClient) {

        this.stompSubscription = this.stompClient.subscribe(topic, (data: Message) => {
          this.listenerSubject.next(data.body);
        });
      }
    });
  }


  unsubscribe(): void {

    if (this.connectionEventSubscription) {
      this.connectionEventSubscription.unsubscribe();
      this.connectionEventSubscription = null;
    }
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
