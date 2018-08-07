import { Component, OnInit, Input } from '@angular/core';
import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { FromEndpoint, FromEndpointService } from '../from-endpoint';
import { ToEndpoint, ToEndpointService } from '../to-endpoint';
import { ErrorEndpoint, ErrorEndpointService } from '../error-endpoint';
import { JhiEventManager } from 'ng-jhipster';
import { Router } from '@angular/router';
import * as moment from 'moment';

enum Status {
    active = 'active',
    paused = 'paused',
    inactive = 'inactive',
    inactiveError = 'inactiveError'
}
@Component({
    selector: '[jhi-flow-row]',
    templateUrl: './flow-row.component.html'
})

export class FlowRowComponent implements OnInit {

    @Input() flow: Flow;
    @Input() fromEndpoints: FromEndpoint[];
    @Input() isAdmin: boolean;

    fromEndpoint: FromEndpoint = new FromEndpoint();
    toEndpoints: Array<ToEndpoint> = [new ToEndpoint()];
    errorEndpoint: ErrorEndpoint = new ErrorEndpoint();

    public isFlowStarted = false;
    public isFlowPaused = false;
    public isFlowResumed = true;
    public isFlowStopped = true;
    public isFlowRestarted = true;
    public disableActionBtns: boolean;

    public flowDetails: string;
    public flowStatus: string;
    public flowStatusError: string;
    public isFlowStatusOK: boolean;
    public flowStatistic: string;
    public flowStatusButton: string;
    public flowStartTime: any;
    public clickButton = false;

    fromEndpointTooltip: string;
    toEndpointsTooltips: Array<string> = [];
    errorEndpointTooltip: string;
    public statusFlow: Status;
    public previousState: string;
    public p = false;
    lastError: string;

    flowRowID: string;
    flowRowErrorEndpointID: string;

    intervalTime: any;

    constructor(
        private flowService: FlowService,
        private fromEndpointService: FromEndpointService,
        private toEndpointService: ToEndpointService,
        private errorEndpointService: ErrorEndpointService,
        private router: Router,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.setFlowStatusDefaults();
        this.getFromEndpoint(this.flow.fromEndpointId);
        this.toEndpoints = this.flow.toEndpoints;
        this.getToEndpoint();
        // this.getErrorEndpoint(this.flow.errorEndpointId);
        this.getFlowStatus(this.flow.id);
        this.registerTriggeredAction();

    }

    setFlowStatusDefaults() {
        this.isFlowStatusOK = true;
        this.flowStatus = 'Stopped';
        this.lastError = '';
        this.setFlowStatus(this.flowStatus);
    }

    setFlowStatus(status: string): void {
        this.getFlowStats(this.flow.id);
        switch (status) {
            case 'unconfigured':
                this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
                this.isFlowStarted = this.isFlowPaused = !this.isFlowStopped;
                this.flowStatusButton = `
                            Last action: - <br/>
                            Status: Flow is stopped<br/>
            `;
                this.statusFlow = Status.inactive;
                break;
            case 'started':
                this.isFlowStarted = this.isFlowResumed = true;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = !this.isFlowStarted;
                this.flowStatusButton = `
                            Last action: Start <br/>
                            Status: Started succesful
                        `;
                this.statusFlow = Status.active;
                break;
            case 'suspended':
                this.isFlowPaused = this.isFlowStarted = true;
                this.isFlowResumed = this.isFlowStopped = this.isFlowRestarted = !this.isFlowPaused;
                this.flowStatusButton = `
                            Last action: Pause <br/>
                            Status:  Paused succesful
            `;
                this.statusFlow = Status.paused;
                break;
            case 'restarted':
                this.isFlowResumed = this.isFlowStarted = true;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = !this.isFlowResumed;
                this.flowStatusButton = `
                            Last action: Restart <br/>
                            Status:  Restarted succesful
            `;
                this.statusFlow = Status.active;
                break;
            case 'resumed':
                this.isFlowResumed = this.isFlowStarted = true;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = !this.isFlowResumed;
                this.flowStatusButton = `
                            Last action: Resume <br/>
                            Status:  Resumed succesful
            `;
                this.statusFlow = Status.active;
                break;
            case 'stopped':
                this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
                this.isFlowStarted = this.isFlowPaused = !this.isFlowStopped;
                this.flowStatusButton = `
                            Last action: Stop <br/>
                            Status: Stopped succesful
            `;
                this.statusFlow = Status.inactive;
                break;
            default:
                this.flowStatusButton = `
                            Last action: ${this.flowStatus} <br/>
                            Status: Stopped after error
            `;
                break;
        }
    }

    getFlowStatus(id: number) {
        this.clickButton = true;
        this.flowService.getFlowStatus(id).subscribe((response) => {
            this.setFlowStatus(response.text());
        });
    }

    navigateToFlow() {
        this.isAdmin ?
            this.router.navigate(['../../flow/edit-all', this.flow.id]) :
            this.router.navigate(['../flow', this.flow.id]);
    }

    getFlowLastError(id: number, action: string, errMesage: string) {
        if (errMesage) {
            this.flowStatusButton = `
            Last action: ${action} <br/>
            Status: Stopped after error <br/><br/>
            ${errMesage}
`;
            this.statusFlow = Status.inactiveError;
        } else {
            this.flowService.getFlowLastError(id).subscribe((response) => {
                this.lastError = response.text() === '0' ? '' : response.text();
                this.flowStatusButton = `
                Last action: ${action} <br/>
                Status: Stopped after error <br/><br/>
                ${this.lastError}
    `;
                this.statusFlow = Status.inactiveError;
            });
        }
    }

    getFlowStats(id: number) {
        this.flowService.getFlowStats(id, this.flow.gatewayId)
            .map((response) => response.json())
            .subscribe((res) => {
                this.setFlowStatistic(res);
            });
    }

    getFlowDetails() {
        this.flowDetails = `
                Name: ${this.flow.name}<br/>
                ID: ${this.flow.id}<br/>
                Autostart: ${this.flow.autoStart}<br/>
                Offloading: ${this.flow.offloading}<br/>
                <br/>
                Click to edit
        `;
    }

    setFlowStatistic(res) {
        if (res === 0) {
            this.flowStatistic = `Currently there is no statistic for this flow.`;
        } else {
            const now = moment(new Date());
            const start = moment(res.stats.startTimestamp);
            const flowRuningTime = moment.duration(now.diff(start));
            const hours = Math.floor(flowRuningTime.asHours());
            const minutes = flowRuningTime.minutes();
            this.flowStatistic = `
                Start time: ${this.checkDate(res.stats.startTimestamp)}<br/>
                Running: ${hours} hours ${minutes} ${minutes > 1 ? 'minutes' : 'minute'} <br/>
                <br/>
                <b>Processing time</b><br/>
                Last: ${res.stats.lastProcessingTime} ms<br/>
                Min: ${res.stats.minProcessingTime} ms<br/>
                Max: ${res.stats.maxProcessingTime} ms<br/>
                Avarage: ${res.stats.meanProcessingTime} ms<br/>
                <br/>
                <b>Completed</b><br/>
                Number of messages: ${res.stats.exchangesCompleted}<br/>
                First: ${this.checkDate(res.stats.firstExchangeCompletedTimestamp)}<br/>
                Last: ${this.checkDate(res.stats.lastExchangeCompletedTimestamp)}<br/>
                <br/>
                <b>Failures</b><br/>
                Number of messages: ${res.stats.exchangesFailed}<br/>
                First: ${this.checkDate(res.stats.firstExchangeFailureTimestamp)}<br/>
                Last: ${this.checkDate(res.stats.lastExchangeFailureTimestamp)}
            `;
        }
    }

    checkDate(r) {
        if (r === '1970-01-01T00:59:59.999+0100') {
            return '-'
        } else {
            return moment(r).format('YYYY-MM-DD HH:mm:ss');
        }
    }

    flowConfigurationNotObtained(id) {
        this.isFlowStatusOK = false;
        this.flowStatusError = `Configuration for flow with id=${id} is not obtained.`;
    }

    getFromEndpoint(id: number) {

        this.fromEndpoints.filter((fromEndpoint) => fromEndpoint.id === id).map((fromEndpoint) => {
            this.fromEndpoint = fromEndpoint;
            this.fromEndpointTooltip = this.endpointTooltip(fromEndpoint.type, fromEndpoint.uri, fromEndpoint.options);
        });

    }

    getToEndpoint() {
        this.toEndpoints.forEach((toEndpoint) => {
            this.toEndpointsTooltips.push(this.endpointTooltip(toEndpoint.type, toEndpoint.uri, toEndpoint.options));
        });
    }

    getErrorEndpoint(id: number) {
        this.errorEndpointService.find(id)
            .subscribe((errorEndpoint) => {
                this.errorEndpoint = errorEndpoint;
                this.errorEndpointTooltip = this.endpointTooltip(errorEndpoint.type, errorEndpoint.uri, errorEndpoint.options);
            });
    }

    endpointTooltip(type, uri, options): string {
        if (type === null) { return };
        const opt = options === '' ? '' : `?${options}`;
        return `${type.toLowerCase()}://${uri}${opt}`;
    }

    curentDateTime(): string {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }

    registerTriggeredAction() {
        this.eventManager.subscribe('trigerAction', (response) => {
            switch (response.content) {
                case 'start':
                    if (this.statusFlow === Status.inactive) {
                        this.start();
                    }
                    break;
                case 'stop':
                    if (this.statusFlow !== Status.inactive) {
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
        this.flowService.getConfiguration(this.flow.id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(this.flow.id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.start(this.flow.id).subscribe((response) => {
                            if (response.status === 200) {
                                this.setFlowStatus('started');
                            }
                            this.disableActionBtns = false;
                        }, (err) => {
                            this.getFlowLastError(this.flow.id, 'Start', err.text());
                            this.isFlowStatusOK = false;
                            this.flowStatusError = `Flow with id=${this.flow.id} is not started.`;
                            this.disableActionBtns = false;
                        });
                    });
            }, (err) => {
                this.flowConfigurationNotObtained(this.flow.id);
                this.disableActionBtns = false;
            });
    }

    pause() {
        this.flowStatus = 'Pausing';
        this.isFlowStatusOK = true;
        this.disableActionBtns = true;
        this.flowService.pause(this.flow.id).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('suspended');
            }
            this.disableActionBtns = false;
        }, (err) => {
            this.getFlowLastError(this.flow.id, 'Pause', err.text());
            this.isFlowStatusOK = false;
            this.flowStatusError = `Flow with id=${this.flow.id} is not paused.`;
            this.disableActionBtns = false;
        });
    }

    resume() {
        this.flowStatus = 'Resuming';
        this.isFlowStatusOK = true;
        this.disableActionBtns = true;
        this.flowService.getConfiguration(this.flow.id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(this.flow.id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.resume(this.flow.id).subscribe((response) => {
                            if (response.status === 200) {
                                this.setFlowStatus('resumed');
                            }
                            this.disableActionBtns = false;
                        }, (err) => {
                            this.getFlowLastError(this.flow.id, 'Resume', err.text());
                            this.isFlowStatusOK = false;
                            this.flowStatusError = `Flow with id=${this.flow.id} is not resumed.`;
                            this.disableActionBtns = false;
                        });
                    });
            }, (err) => {
                this.flowConfigurationNotObtained(this.flow.id);
                this.disableActionBtns = false;
            });
    }

    restart() {
        this.flowStatus = 'Restarting';
        this.isFlowStatusOK = true;
        this.disableActionBtns = true;
        this.flowService.getConfiguration(this.flow.id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(this.flow.id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.restart(this.flow.id).subscribe((response) => {
                            if (response.status === 200) {
                                this.setFlowStatus('restarted');
                            }
                            this.disableActionBtns = false;
                        }, (err) => {
                            this.getFlowLastError(this.flow.id, 'Restart', err.text());
                            this.isFlowStatusOK = false;
                            this.flowStatusError = `Flow with id=${this.flow.id} is not restarted.`;
                            this.disableActionBtns = false;
                        });
                    });
            }, (err) => {
                this.flowConfigurationNotObtained(this.flow.id);
                this.disableActionBtns = false;
            });
    }

    stop() {
        this.flowStatus = 'Stopping';
        this.isFlowStatusOK = true;
        this.disableActionBtns = true;
        this.flowService.stop(this.flow.id).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('stopped');
            }
            this.disableActionBtns = false;
        }, (err) => {
            this.getFlowLastError(this.flow.id, 'Stop', err.text());
            this.isFlowStatusOK = false;
            this.flowStatusError = `Flow with id=${this.flow.id} is not stopped.`;
            this.disableActionBtns = false;
        });
    }
}
