import { Component, Input, OnInit } from '@angular/core';
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

enum Status {
  active = 'active',
  paused = 'paused',
  inactive = 'inactive',
  inactiveError = 'inactiveError',
}
@Component({
  standalone: false,
  selector: '[jhi-flow-row]',
  templateUrl: './flow-row.component.html',
})
export class FlowRowComponent implements OnInit {
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

  public flowError: string;
  public flowErrorButton: string;

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
  }

  setErrorMessage(action: string, error: string){

      this.flowError = `true`;

      try {

          if (this.statusMessage.flow.stepsLoaded) {

                  const total = this.statusMessage.flow.stepsLoaded.total;
                  const failed = this.statusMessage.flow.stepsLoaded.failed;

                  this.flowErrorButton = `${failed} of ${total} steps failed to start <br/><br/>
                                           <b>Details:</b> <br/>`;

                  for (let i = 0; i < this.statusMessage.flow.steps.length; i++) {

                      const id = this.statusMessage.flow.steps[i].id;
                      const uri = this.statusMessage.flow.steps[i].uri;
                      const status = this.statusMessage.flow.steps[i].status;

                      if(status==='error' && uri){

                          const errorMessage = this.statusMessage.flow.steps[i].errorMessage;

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
                          const errorMessage = this.statusMessage.flow.steps[i].errorMessage;

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
              this.flowErrorButton = this.statusMessage.flow.message;
          }
      } catch (e) {
           this.flowErrorButton = error;
      }

  }

  async getFlowAlertsPoll() {

    this.getFlowNumberOfAlerts(this.flow.id);

    if(this.isFlowStarted) {
      setTimeout(() => {
        this.getFlowAlertsPoll();
      }, 10000);
    }

  }

  getFlowAlerts(id: number) {

    this.clickButton = true;
    this.flowService.getFlowAlerts(id).subscribe(response => {
      this.setFlowAlerts(response.body);
    });
  }

  setFlowAlerts(flowAlertsItems: string): void {

    if (flowAlertsItems !== null && flowAlertsItems!== '0') {

	    const flowAlertsList = flowAlertsItems.split(',');
      const flowAlertLength = flowAlertsList.length;

      let alertStartItem;
      let alertEndItem;

      if (flowAlertsList.length < 4) {
        alertStartItem = flowAlertLength - 1;
        alertEndItem = 0;
      } else {
        alertStartItem = flowAlertLength - 1;
        alertEndItem = flowAlertLength - 3;
      }

      let i;
      let alertItems = '';
      for (i = alertStartItem; i >= alertEndItem; i--) {
        alertItems += `<a class="list-group-item"><h5 class="mb-1">` + flowAlertsList[i] + `</h5></a>`;
      }

      this.flowAlertsButton = `<div class="list-group">` + alertItems + `</div>`;

    }
  }

  getFlowNumberOfAlerts(id: number) {
    this.clickButton = true;

    this.flowService.getFlowNumberOfAlerts(id).subscribe(response => {
      this.setFlowNumberOfAlertsString(response.body);
    });
  }

  setFlowNumberOfAlertsString(numberOfAlertsString: string): void {
    let numberOfAlerts = parseInt(numberOfAlertsString, 10);
    this.setFlowNumberOfAlerts(numberOfAlerts);
  }

  setFlowNumberOfAlerts(numberOfAlerts: number): void {

    if (numberOfAlerts == 0) {
      this.flowAlerts = `false`;
      this.numberOfAlerts = `0`;
      this.showNumberOfItems = 3;
    } else {
      this.flowAlerts = `true`;
      this.numberOfAlerts = numberOfAlerts;
      if (numberOfAlerts < 4) {
        this.showNumberOfItems = numberOfAlerts;
      } else {
        this.showNumberOfItems = 3;
      }
    }

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
    this.router.navigate(['../../flow/editor', this.flow.id], {queryParams: { mode: mode, editor: editorType, stepid: step.id }});
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

    console.log('get flow stats');

    this.flowStatistic = ``;
    this.statsTableRows = [];

    for (const step of flow.steps) {

       console.log('get flow stats step=' + step.stepType);

      if (step.stepType === StepType.SOURCE) {
        this.flowService.getFlowStats(flow.id, step.id).subscribe(res => {
          this.setFlowStatistic(res.body, step.componentType.toString() + '://' + step.uri, step.stepType);
        });
      }else if(step.stepType === StepType.SCRIPT || step.stepType === StepType.ROUTE ){
        this.flowService.getFlowStats(flow.id, step.id).subscribe(res => {
          this.setFlowStatistic(res.body, flow.id + '-' + step.id, step.stepType);
        });

      }
    }

  }

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
  setFlowStatistic(res, uri, stepType) {

    if (res.step.status != 'started') {
      this.flowStatistic = `There are no stats yet.`;
    } else {

      const step = this.capitalizeFirstLetter(stepType);
      const now = dayjs();
      const start = dayjs(res.step.stats.startTimestamp);
      const flowRuningTime = dayjs.duration(now.diff(start));
      const hours = Math.floor(flowRuningTime.asHours());
      const minutes = flowRuningTime.minutes();
      const completed = parseInt(res.step.stats.exchangesCompleted) - parseInt(res.step.stats.failuresHandled);
      const failures = parseInt(res.step.stats.exchangesFailed) + parseInt(res.step.stats.failuresHandled);

      this.flowStatistic =
        `
          <b>${step}:</b> ${uri}<br/>
          <b>Start time:</b> ${this.checkDate(res.step.stats.startTimestamp)}<br/>
          <b>Running:</b> ${hours} hours ${minutes} ${minutes > 1 ? 'minutes' : 'minute'}<br/><br/>
          <b>Last message:</b> ${this.checkDate(res.step.stats.lastExchangeCompletedTimestamp)}<br/>
          <b>Completed:</b> ${completed}<br/>
          <b>Failed:</b> ${failures}<br/>

        `;
    }

  }

    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
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
    this.flowError = `false`;

    if(this.flow.logLevel === LogLevelType.TRACE){
      this.enableTracing();
    }

    this.flowService.getConfiguration(this.flow.id).subscribe(
      data => {
        this.flowService.setConfiguration(this.flow.id, data.body, 'true').subscribe(data2 => {
          this.flowService.start(this.flow.id).subscribe(
            response => {
              this.statusMessage = JSON.parse(response.body);
   			      this.setFlowStatus(this.statusMessage.flow.event);
              this.disableActionBtns = false;
            },
            err => {
     			    this.setFlowStatus(err.error);
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
        this.statusMessage = JSON.parse(response.body);
	      this.setFlowStatus(this.statusMessage.flow.event);
        this.disableActionBtns = false;
      },
      err => {
		    this.setFlowStatus('error');
        this.getFlowLastError(this.flow.id, 'Start', err.error);
        this.isFlowStatusOK = false;
        this.flowStatusError = `Flow with id=${this.flow.id} is not paused`;
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
              this.statusMessage = JSON.parse(response.body);
   			      this.setFlowStatus(this.statusMessage.flow.event);
              this.disableActionBtns = false;
            },
            err => {
     			    this.setFlowStatus('error');
              this.getFlowLastError(this.flow.id, 'Start', err.error);
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
    this.flowAlerts = `false`;

    if(this.flow.logLevel === LogLevelType.OFF){
      this.disableTracing();
    }

    this.flowService.getConfiguration(this.flow.id).subscribe(
      data => {
        this.flowService.setConfiguration(this.flow.id, data.body, 'true').subscribe(data2 => {
          this.flowService.restart(this.flow.id).subscribe(
            response => {
              this.statusMessage = JSON.parse(response.body);
   			      this.setFlowStatus(this.statusMessage.flow.event);
              this.disableActionBtns = false;
            },
            err => {
     			    this.setFlowStatus('error');
              this.getFlowLastError(this.flow.id, 'Start', err.error);
              this.isFlowStatusOK = false;
              this.flowStatusError = `Flow with id=${this.flow.id} is not started.`;
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
        this.statusMessage = JSON.parse(response.body);
	      this.setFlowStatus(this.statusMessage.flow.event);
        this.disableActionBtns = false;
      },
      err => {
		    this.setFlowStatus('error');
        this.getFlowLastError(this.flow.id, 'Start', err.error);
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
        response => {
          //console.log('2. Removed' + response);
        },
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
