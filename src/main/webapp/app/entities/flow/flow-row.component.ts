import { Component, OnInit, Input } from '@angular/core';
import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { JhiEventManager } from 'ng-jhipster';
import { FromEndpoint, FromEndpointService } from '../from-endpoint';
import { ToEndpoint, ToEndpointService } from '../to-endpoint';
import { ErrorEndpoint, ErrorEndpointService } from '../error-endpoint';

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
    public isFlowPaused = true;
    public isFlowResumed = true;
    public isFlowStoped = true;

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
        return `${type.toLowerCase()}://${uri}?${options}`;
    }

    start(id: number) {
        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.start(id).subscribe((response) => {
                            this.isFlowStarted = this.isFlowResumed = response.status === 200;
                            this.isFlowPaused = this.isFlowStoped = !this.isFlowStarted;
                        });
                    });
            });
    }

    pause(id: number) {
        this.flowService.pause(id).subscribe((response) => {
            this.isFlowPaused = this.isFlowStarted = response.status === 200;
            this.isFlowResumed = this.isFlowStoped = !this.isFlowPaused;
            this.eventManager.broadcast({
                name: 'flowListModification',
                content: 'Pause an flow'
            });
        });
    }

    resume(id: number) {
        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.resume(id).subscribe((response) => {
                            this.isFlowResumed = this.isFlowStarted = response.status === 200;
                            this.isFlowPaused = this.isFlowStoped = !this.isFlowResumed;
                            this.eventManager.broadcast({
                                name: 'flowListModification',
                                content: 'Resume an flow'
                            });
                        });
                    });
            });
    }

    restart(id: number) {
        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.restart(id).subscribe((response) => {
                            this.isFlowStarted = this.isFlowResumed = response.status === 200;
                            this.isFlowPaused = this.isFlowStoped = !this.isFlowStarted;
                        });
                    });
            });
    }

    stop(id: number) {
        this.flowService.stop(id).subscribe((response) => {
            this.isFlowStoped = this.isFlowPaused = this.isFlowResumed = response.status === 200;
            this.isFlowStarted = !this.isFlowStoped;
        });
    }
}
