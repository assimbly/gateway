import { Component, OnInit, Input } from '@angular/core';
import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { JhiEventManager } from 'ng-jhipster';
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
    public isFlowStoped = true;
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
        this.flowStatus = 'Stoped';
        this.flowStatusToolTip = '';
        this.getFromEndpoint(this.flow.fromEndpointId);
        this.getToEndpoint(this.flow.id);
        this.getErrorEndpoint(this.flow.errorEndpointId);
    }

    getFromEndpoint(id: number) {
        this.fromEndpointService.find(id)
            .subscribe((fromEndpoint) => {
                this.fromEndpoint = fromEndpoint;
                this.fromEndpointTooltip = this.endpointTooltip(fromEndpoint.type, fromEndpoint.uri, fromEndpoint.options);
            });
    }

    getToEndpoint(id: number) {
        this.toEndpointService.find(id)
            .subscribe((toEndpoint) => {
                this.toEndpoint = toEndpoint;
                this.toEndpointTooltip = this.endpointTooltip(toEndpoint.type, toEndpoint.uri, toEndpoint.options);
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
        if (type === null) {return};
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
                            this.isFlowStarted = this.isFlowResumed = response.status === 200;
                            this.isFlowPaused = this.isFlowStoped = this.isFlowRestarted = !this.isFlowStarted;
                            this.flowStatus = 'Started';
                            this.flowStatusToolTip = 'Started at ' + this.curentDateTime();
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
            this.isFlowPaused = this.isFlowStarted = response.status === 200;
            this.isFlowResumed = this.isFlowStoped = this.isFlowRestarted = !this.isFlowPaused;
            this.flowStatus = 'Paused';
            this.flowStatusToolTip = 'Paused at ' + this.curentDateTime();
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
                            this.isFlowResumed = this.isFlowStarted = response.status === 200;
                            this.isFlowPaused = this.isFlowStoped = this.isFlowRestarted = !this.isFlowResumed;
                            this.flowStatus = 'Resumed';
                            this.flowStatusToolTip = 'Resumed at ' + this.curentDateTime();
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
                            this.isFlowResumed = this.isFlowStarted = response.status === 200;
                            this.isFlowPaused = this.isFlowStoped = this.isFlowRestarted = !this.isFlowResumed;
                            this.flowStatus = 'Restarted';
                            this.flowStatusToolTip = 'Restarted at ' + this.curentDateTime();
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
            this.isFlowStoped  =  this.isFlowRestarted = this.isFlowResumed = response.status === 200;
            this.isFlowStarted = this.isFlowPaused = !this.isFlowStoped;
            this.flowStatus = 'Stoped';
            this.flowStatusToolTip = 'Stoped at ' + this.curentDateTime();
        }, (err) => {
            this.isFlowStatusOK = false;
            this.flowStatusError = err;
        });
    }
}
