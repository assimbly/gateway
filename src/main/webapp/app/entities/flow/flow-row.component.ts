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
    public flowStatusToolTip: string;
    public flowStatusError: string;
    public isFlowStatusOK: boolean;

    fromEndpointTooltip: string;
    toEndpointTooltip: string;
    errorEndpointTooltip: string;

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
        this.flowStatusToolTip = '';
        this.getFromEndpoint(this.flow.fromEndpointId);
        this.getToEndpointByFlowId(this.flow.id);
        this.getErrorEndpoint(this.flow.errorEndpointId);
        this.getFlowStatus(this.flow.id);
    }

    getFlowStatus(id: number) {
        this.flowService.getFlowStatus(id).subscribe((response) => {
            this.setFlowStatus(response.text());
        });
    }

    setFlowStatus(status: string): void {
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
        const opt = options === null ? '' : `?${options}`;
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
                                this.flowStatusToolTip = 'Started at ' + this.curentDateTime();
                            }
                        }, (err) => {
                            this.isFlowStatusOK = false;
                            this.flowStatusError = err;
                        });
                    });
            });
    }

    pause(id: number) {
        this.flowStatus = 'Pausing';
        this.isFlowStatusOK = true;
        this.flowService.pause(id).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('suspended');
                this.flowStatusToolTip = 'Paused at ' + this.curentDateTime();
            }
        }, (err) => {
            this.isFlowStatusOK = false;
            this.flowStatusError = err;
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
                                this.flowStatusToolTip = 'Resumed at ' + this.curentDateTime();
                            }
                        }, (err) => {
                            this.isFlowStatusOK = false;
                            this.flowStatusError = err;
                        });
                    });
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
                                this.flowStatusToolTip = 'Restarted at ' + this.curentDateTime();
                            }
                        }, (err) => {
                            this.isFlowStatusOK = false;
                            this.flowStatusError = err;
                        });
                    });
            });
    }

    stop(id: number) {
        this.flowStatus = 'Stopping';
        this.isFlowStatusOK = true;
        this.flowService.stop(id).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('stopped');
                this.flowStatusToolTip = 'Stopped at ' + this.curentDateTime();
            }
        }, (err) => {
            this.isFlowStatusOK = false;
            this.flowStatusError = err;
        });
    }
}
