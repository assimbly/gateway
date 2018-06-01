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
    public configId: number;
    public liveModeForm: FormGroup;
    public configuration: any;
    public isConfigurationSet: boolean;

    public isFlowStarted = false;
    public isFlowPaused = false;
    public isFlowResumed = true;
    public isFlowStopped = true;
    public isFlowRestarted = true;

    constructor(
        private flowService: FlowService
    ) {
    }

    ngOnInit() {
        this.initializeLiveModeForm();
    }

    initializeLiveModeForm() {
        this.liveModeForm = new FormGroup({
            'xmlEditor': new FormControl(this.xmlEditor),
            'configId': new FormControl(this.configId)
        });
    }

    setLiveConfiguration() {
        this.configId = this.liveModeForm.controls.configId.value;
        this.xmlEditor = this.liveModeForm.controls.xmlEditor.value;
        this.flowService.setConfiguration(this.configId, this.xmlEditor, 'application/xml')
            // .map((response) => response.text())
            .subscribe((config) => {
                this.configuration = config;
                this.isConfigurationSet = true;
            }, (err) => {
                let io = err;
            });
    }

    start() {
        this.flowService.start(this.configId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('started');
            }
        }, (err) => {
        });
    }

    pause() {
        this.flowService.pause(this.configId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('suspended');
            }
        }, (err) => {
        });
    }

    resume() {
        this.flowService.resume(this.configId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('resumed');
            }
        }, (err) => {
        });
    }

    restart() {
        this.flowService.restart(this.configId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('restarted');
            }
        }, (err) => {
        });
    }

    stop() {
        this.flowService.stop(this.configId).subscribe((response) => {
            if (response.status === 200) {
                this.setFlowStatus('stopped');
            }
        }, (err) => {
        });
    }

    setFlowStatus(status: string): void {
        switch (status) {
            case 'unconfigured':
                this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
                this.isFlowStarted = this.isFlowPaused = !this.isFlowStopped;
                break;
            case 'started':
                this.isFlowStarted = this.isFlowResumed = true;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = !this.isFlowStarted;
                break;
            case 'suspended':
                this.isFlowPaused = this.isFlowStarted = true;
                this.isFlowResumed = this.isFlowStopped = this.isFlowRestarted = !this.isFlowPaused;
                break;
            case 'restarted':
                this.isFlowResumed = this.isFlowStarted = true;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = !this.isFlowResumed;
                break;
            case 'resumed':
                this.isFlowResumed = this.isFlowStarted = true;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = !this.isFlowResumed;
                break;
            case 'stopped':
                this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
                this.isFlowStarted = this.isFlowPaused = !this.isFlowStopped;
                break;
            default:
                break;
        }
    }
}
