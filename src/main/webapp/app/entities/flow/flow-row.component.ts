import { Component, OnInit, Input } from '@angular/core';
import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { FromEndpoint, FromEndpointService } from '../from-endpoint';
import { ToEndpoint, ToEndpointService } from '../to-endpoint';
import { ErrorEndpoint, ErrorEndpointService } from '../error-endpoint';
import * as moment from 'moment';

@Component({
    selector: '[jhi-flow-row]',
    templateUrl: './flow-row.component.html'
})

export class FlowRowComponent implements OnInit {

    @Input() flow: Flow;

    fromEndpoint: FromEndpoint = new FromEndpoint();
    toEndpoint: ToEndpoint = new ToEndpoint();
    errorEndpoint: ErrorEndpoint = new ErrorEndpoint();

    public isFlowStarted = false;
    public isFlowPaused = false;
    public isFlowResumed = true;
    public isFlowStopped = true;
    public isFlowRestarted = true;

    public flowStatus: string;
    public flowStatusError: string;
    public isFlowStatusOK: boolean;
    public flowStatistic: string;
    public flowStartTime: any;

    fromEndpointTooltip: string;
    toEndpointTooltip: string;
    errorEndpointTooltip: string;

    intervalTime: any;

    constructor(
        private flowService: FlowService,
        private fromEndpointService: FromEndpointService,
        private toEndpointService: ToEndpointService,
        private errorEndpointService: ErrorEndpointService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isFlowStatusOK = true;
        this.flowStatus = 'Stopped';
        this.getFromEndpoint(this.flow.fromEndpointId);
        this.getToEndpointByFlowId(this.flow.id);
        this.getErrorEndpoint(this.flow.errorEndpointId);
        this.getFlowStatus(this.flow.id);
        this.getFlowStats(this.flow.id);
    }

    getFlowStatus(id: number) {
        this.flowService.getFlowStatus(id).subscribe((response) => {
            this.setFlowStatus(response.text());
        });
    }

    setFlowStatus(status: string): void {
        this.getFlowStats(this.flow.id);
        switch (status) {
            case 'unconfigured':
                this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
                this.isFlowStarted = this.isFlowPaused = !this.isFlowStopped;
                this.flowStatus = 'Stopped';
                break;
            case 'started':
                this.isFlowStarted = this.isFlowResumed = true;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = !this.isFlowStarted;
                this.flowStatus = 'Started';
                break;
            case 'suspended':
                this.isFlowPaused = this.isFlowStarted = true;
                this.isFlowResumed = this.isFlowStopped = this.isFlowRestarted = !this.isFlowPaused;
                this.flowStatus = 'Paused';
                break;
            case 'restarted':
                this.isFlowResumed = this.isFlowStarted = true;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = !this.isFlowResumed;
                this.flowStatus = 'Restarted';
                break;
            case 'resumed':
                this.isFlowResumed = this.isFlowStarted = true;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = !this.isFlowResumed;
                this.flowStatus = 'Resumed';
                break;
            case 'stopped':
                this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
                this.isFlowStarted = this.isFlowPaused = !this.isFlowStopped;
                this.flowStatus = 'Stopped';
                break;
            default:
                this.flowStatus = 'Unknown';
                break;
        }
    }

    getFlowStats(id: number) {
        this.flowService.getFlowStats(id, this.flow.gatewayId)
            .map((response) => response.json())
            .subscribe((res) => {
                this.setFlowStatistic(res, id);
            });
    }

    setFlowStatistic(r, id: number) {
        clearInterval(this.intervalTime);
        if (r === 0) {
            this.flowStatistic = `Currently there is no statistic for this flow.`;
        } else {
            this.intervalTime = setInterval(() => {
                this.flowService.getFlowStats(id, this.flow.gatewayId).map((response) => response.json()).subscribe((res) => {
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
                });
            }, 1000);
        }
    }
    checkDate(r) {
    if (r === '1970-01-01T00:59:59.999+0100') {
        return  '-'
    }else {
        return moment(r).format('YYYY-MM-DD HH:mm:ss');
    } }

    flowConfigurationNotObtained(id) {
        this.isFlowStatusOK = false;
        this.flowStatusError = `Configuration for flow with id=${id} is not obtained.`;
    }

    getFromEndpoint(id: number) {
        this.fromEndpointService.find(id)
            .subscribe((fromEndpoint) => {
                this.fromEndpoint = fromEndpoint;
                this.fromEndpointTooltip = this.endpointTooltip(fromEndpoint.type, fromEndpoint.uri, fromEndpoint.options);
            });
    }

    getToEndpointByFlowId(id: number) {
        this.toEndpointService.findByFlowId(id)
            .subscribe((toEndpoints) => {
                this.toEndpoint = toEndpoints[0];
                this.toEndpointTooltip = this.endpointTooltip(this.toEndpoint.type, this.toEndpoint.uri, this.toEndpoint.options);
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

    start(id: number) {
        this.flowStatus = 'Starting';
        this.isFlowStatusOK = true;
        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.start(id).subscribe((response) => {
                            if (response.status === 200) {
                                this.setFlowStatus('started');
                            }
                        }, (err) => {
                            this.isFlowStatusOK = false;
                            this.flowStatusError = `Flow with id=${id} is not started.`;
                        });
                    });
            }, (err) => {
                this.flowConfigurationNotObtained(id);
            });
    }

    pause(id: number) {
        this.flowStatus = 'Pausing';
        this.isFlowStatusOK = true;
        this.flowService.pause(id).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('suspended');
            }
        }, (err) => {
            this.isFlowStatusOK = false;
            this.flowStatusError = `Flow with id=${id} is not paused.`;
        });
    }

    resume(id: number) {
        this.flowStatus = 'Resuming';
        this.isFlowStatusOK = true;
        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.resume(id).subscribe((response) => {
                            if (response.status === 200) {
                                this.setFlowStatus('resumed');
                            }
                        }, (err) => {
                            this.isFlowStatusOK = false;
                            this.flowStatusError = `Flow with id=${id} is not resumed.`;
                        });
                    });
            }, (err) => {
                this.flowConfigurationNotObtained(id);
            });
    }

    restart(id: number) {
        this.flowStatus = 'Restarting';
        this.isFlowStatusOK = true;
        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.restart(id).subscribe((response) => {
                            if (response.status === 200) {
                                this.setFlowStatus('restarted');
                            }
                        }, (err) => {
                            this.isFlowStatusOK = false;
                            this.flowStatusError = `Flow with id=${id} is not restarted.`;
                        });
                    });
            }, (err) => {
                this.flowConfigurationNotObtained(id);
            });
    }

    stop(id: number) {
        this.flowStatus = 'Stopping';
        this.isFlowStatusOK = true;
        this.flowService.stop(id).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('stopped');
            }
        }, (err) => {
            this.isFlowStatusOK = false;
            this.flowStatusError = `Flow with id=${id} is not stopped.`;
        });
    }
}
