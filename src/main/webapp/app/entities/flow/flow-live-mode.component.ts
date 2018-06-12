import { Component, OnInit } from '@angular/core';
import { NgbTabsetConfig } from '@ng-bootstrap/ng-bootstrap';
import { FlowService } from './flow.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
    selector: 'jhi-flow-live-mode',
    templateUrl: './flow-live-mode.component.html'
})
export class FlowLiveModeComponent implements OnInit {

    public xmlEditor: string;
    public flowId: number;
    public liveModeForm: FormGroup;
    public configuration: any;
    public isConfigurationSet: boolean;
    public configuredFlows: Array<ConfiguredFlow> = [];
    public hasLoadError: boolean;

    constructor(
        private flowService: FlowService
    ) {
    }

    ngOnInit() {
        this.initializeLiveModeForm();
    }

    initializeLiveModeForm() {
        this.liveModeForm = new FormGroup({
            'flowId': new FormControl(this.flowId)
        });
    }

    setLiveConfiguration() {
        this.flowId = this.liveModeForm.controls.flowId.value;
        this.flowService.setConfiguration(this.flowId, this.xmlEditor, 'application/xml')
            .map((response) => response.text())
            .subscribe((config) => {
                this.configuration = config;
                this.showInfoMessage(true);

                let configuredFlow = new ConfiguredFlow();
                configuredFlow.flowId = this.flowId;
                configuredFlow.isFlowStarted = false;
                configuredFlow.isFlowPaused = false;
                configuredFlow.isFlowResumed = true;
                configuredFlow.isFlowStopped = true;
                configuredFlow.isFlowRestarted = true;
                this.configuredFlows.push(configuredFlow);
            }, (err) => {
                this.showInfoMessage(false);
            });
    }

    showInfoMessage(isSuccess) {
        isSuccess ? this.isConfigurationSet = true : this.hasLoadError = true;
        setTimeout(() => {
            this.isConfigurationSet = false;
            this.hasLoadError = false
        }, 10000);
    }

    start(configuredFlow: ConfiguredFlow) {
        this.flowService.start(configuredFlow.flowId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('started', configuredFlow);
            }
        }, (err) => {
        });
    }

    pause(configuredFlow: ConfiguredFlow) {
        this.flowService.pause(configuredFlow.flowId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('suspended', configuredFlow);
            }
        }, (err) => {
        });
    }

    resume(configuredFlow: ConfiguredFlow) {
        this.flowService.resume(configuredFlow.flowId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('resumed', configuredFlow);
            }
        }, (err) => {
        });
    }

    restart(configuredFlow: ConfiguredFlow) {
        this.flowService.restart(configuredFlow.flowId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('restarted', configuredFlow);
            }
        }, (err) => {
        });
    }

    stop(configuredFlow: ConfiguredFlow) {
        this.flowService.stop(configuredFlow.flowId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('stopped', configuredFlow);
            }
        }, (err) => {
        });
    }

    setFlowStatus(status: string, configuredFlow: ConfiguredFlow): void {
        switch (status) {
            case 'unconfigured':
                configuredFlow.isFlowStopped = configuredFlow.isFlowRestarted = configuredFlow.isFlowResumed = true;
                configuredFlow.isFlowStarted = configuredFlow.isFlowPaused = !configuredFlow.isFlowStopped;
                break;
            case 'started':
                configuredFlow.isFlowStarted = configuredFlow.isFlowResumed = true;
                configuredFlow.isFlowPaused = configuredFlow.isFlowStopped = configuredFlow.isFlowRestarted = !configuredFlow.isFlowStarted;
                break;
            case 'suspended':
                configuredFlow.isFlowPaused = configuredFlow.isFlowStarted = true;
                configuredFlow.isFlowResumed = configuredFlow.isFlowStopped = configuredFlow.isFlowRestarted = !configuredFlow.isFlowPaused;
                break;
            case 'restarted':
                configuredFlow.isFlowResumed = configuredFlow.isFlowStarted = true;
                configuredFlow.isFlowPaused = configuredFlow.isFlowStopped = configuredFlow.isFlowRestarted = !configuredFlow.isFlowResumed;
                break;
            case 'resumed':
                configuredFlow.isFlowResumed = configuredFlow.isFlowStarted = true;
                configuredFlow.isFlowPaused = configuredFlow.isFlowStopped = configuredFlow.isFlowRestarted = !configuredFlow.isFlowResumed;
                break;
            case 'stopped':
                configuredFlow.isFlowStopped = configuredFlow.isFlowRestarted = configuredFlow.isFlowResumed = true;
                configuredFlow.isFlowStarted = configuredFlow.isFlowPaused = !configuredFlow.isFlowStopped;
                break;
            default:
                break;
        }
    }
}

export class ConfiguredFlow {
    flowId: number;
    isFlowStarted: boolean;
    isFlowPaused: boolean;
    isFlowResumed: boolean;
    isFlowStopped: boolean;
    isFlowRestarted: boolean;
}
