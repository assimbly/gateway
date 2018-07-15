import { Component, OnInit } from '@angular/core';
import { FlowService } from './flow.service';
import { FormGroup, FormControl } from '@angular/forms';
import { flowExamples } from '../../shared/camel/component-type';

@Component({
    selector: 'jhi-flow-editor-mode',
    templateUrl: './flow-editor-mode.component.html'
})
export class FlowEditorModeComponent implements OnInit {

    public xmlEditor: string;
    public nameTypeFlow: string;
    public flowId: number;
    public liveModeForm: FormGroup;
    public configuration: any;
    public isConfigurationSet: boolean;
    public configuredFlows: Array<ConfiguredFlow> = [];
    public flowExamples: Array<FlowExamples> = flowExamples;
    public selectedFlowExample: FlowExamples = new FlowExamples();
    public test: Array<FlowExamples>;
    public flowExampleListName: any[] = [];
    public flowExampleListType: any[] = ['XML', 'JSON', 'YAML'];
    public status = false;
    public hasLoadError: boolean;
    public selectedFiletype: string;
    private hintText =
    `<!--
    In editor mode you can try new flows!

    1) Create the configuration in XML, JSON or YAML (tip: load an example)
    2) Choose the ID of your flow and filetype
    3) Use the "try" button to set the configuration.

    A flow running in editor mode is not persistent. To make a flow persistent save the flow.
    The flow is then added to the main page.
-->`;

    constructor(
        private flowService: FlowService
    ) {
    }

    ngOnInit() {
        this.flowExampleListName = this.flowExamples.map((x) => x.name).filter((v, i, a) => a.indexOf(v) === i);
        this.flowExampleListType = this.flowExamples.map((x) => x.flowtypeFile).filter((v, i, a) => a.indexOf(v) === i);
        this.selectedFlowExample.flowtypeFile = 'XML';
        this.initializeLiveModeForm();
        this.xmlEditor = this.hintText;
    }

    removeHintText() {
        if (this.xmlEditor === this.hintText) {
            this.xmlEditor = '';
        }
    }

    initializeLiveModeForm() {
        this.liveModeForm = new FormGroup({
            'flowId': new FormControl(this.flowId)
        });
    }

    addExample(componentType: string) {

        this.selectedFlowExample.name = componentType;

        this.status = false;
        this.xmlEditor = this.flowExamples.find((fe) => fe.name === this.selectedFlowExample.name && fe.flowtypeFile === this.selectedFlowExample.flowtypeFile).fileExample;
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

    saveFlows() {
        this.flowId = this.liveModeForm.controls.flowId.value;
        this.flowService.saveFlows(this.flowId, this.xmlEditor, 'application/xml')
            .map((response) => response.text())
            .subscribe((response) => {
                this.configuration = response;
                this.showInfoMessage(true);
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
export class FlowExamples {

    name: string;
    flowtypeFile: string;
    fileExample: string;
}
