import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlowService } from './flow.service';
import { flowExamples } from '../../shared/camel/component-type';
import { map } from "rxjs/operators";

@Component({
    selector: 'jhi-flow-editor-mode',
    templateUrl: './flow-editor-mode.component.html'
})
export class FlowEditorModeComponent implements OnInit {

    account: Account;
    public xmlEditor: string;
    public nameTypeFlow: string;
    public flowId: number;
    public flowIdInEditor: number;
    public editorEmpty: boolean;
    public editorFlowIdDoesNotExists: boolean;
    public flowIdsDoesNotMatch: boolean;
    public configuration: any;
    public isConfigurationSet: boolean;
    public configuredFlows: Array<ConfiguredFlow> = [];
    public flowExamples: Array<FlowExamples> = flowExamples;
    public selectedFlowExample: FlowExamples = new FlowExamples();
    public test: Array<FlowExamples>;
    public flowExampleListName: any[] = [];
    public flowExampleListType: any[] = ['XML', 'JSON', 'YAML'];
    public mediaTypeCheck = false;
    public hasLoadError: boolean;
    public loadErrorMessage: string;
    public selectedFiletype: string;
    public isConfigurationInvalid: boolean;
    public invalidConfigurationMessage = '';
    private mediaType: string;
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
        private flowService: FlowService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.flowExampleListName = this.flowExamples.map((x) => x.name).filter((v, i, a) => a.indexOf(v) === i);
        this.flowExampleListType = this.flowExamples.map((x) => x.flowtypeFile).filter((v, i, a) => a.indexOf(v) === i);
        this.selectedFlowExample.flowtypeFile = 'XML';
        this.xmlEditor = this.hintText;
    }

    removeHintText() {
        if (this.xmlEditor === this.hintText) {
            this.xmlEditor = '';
            this.editorEmpty = true;
        }
        this.validate();
    }

    findIdInEditor(): string {
        let id;

        if (this.xmlEditor === this.hintText) { return; }

        switch (this.selectedFlowExample.flowtypeFile) {
            case 'XML':
                try {
                    let convert = require('xml-js');
                    let obj = JSON.parse(convert.xml2json(this.xmlEditor, { compact: true, spaces: 4 }));
                    id = obj.connectors.connector.flows.flow.id._text;
                    this.isConfigurationInvalid = false;
                } catch (e) {
                    this.isConfigurationInvalid = true;
                    this.invalidConfigurationMessage = 'XML configuration is invalid.';
                }
                break;
            case 'JSON':
                try {
                    let obj = JSON.parse(this.xmlEditor);
                    id = obj.connectors.connector.flows.flow.id;
                    this.isConfigurationInvalid = false;
                } catch (e) {
                    this.isConfigurationInvalid = true;
                    this.invalidConfigurationMessage = 'JSON configuration is invalid.';
                }
                break;
            case 'YAML':
                try {
                    let yaml = require('yaml-js');
                    let obj = yaml.load(this.xmlEditor);
                    id = obj.connectors.connector.flows.flow.id;
                    this.isConfigurationInvalid = false;
                } catch (e) {
                    this.isConfigurationInvalid = true;
                    this.invalidConfigurationMessage = 'YAML configuration is invalid.';
                }
                break;
            default:
                break;
        }
        return id;
    }

    validate() {
        this.validateEditor();
        this.validateFlowIdsMatch();
        this.validateEditorFlowId();
    }

    private validateEditor() {
        this.editorEmpty = !this.xmlEditor;
        this.flowIdInEditor = Number(this.findIdInEditor());
    }

    private validateFlowIdsMatch() {
        this.flowIdsDoesNotMatch = this.flowIdInEditor !== Number(this.flowId);
    }

    private validateEditorFlowId() {
        this.editorFlowIdDoesNotExists = isNaN(this.flowIdInEditor);
    }

    addExample(componentType: string) {

        this.selectedFlowExample.name = componentType;
        this.xmlEditor = this.flowExamples.find((fe) => fe.name === this.selectedFlowExample.name && fe.flowtypeFile === this.selectedFlowExample.flowtypeFile).fileExample;

    }

    setLiveConfiguration() {

        switch (this.selectedFlowExample.flowtypeFile) {
            case 'XML':
                this.mediaType = 'application/xml';
                this.mediaTypeCheck = false;
                break;
            case 'JSON':
                this.mediaType = 'application/json';
                this.mediaTypeCheck = false;
                break;
            case 'YAML':
                this.mediaType = 'text/plain';
                this.mediaTypeCheck = false;
                break;
            default:
                this.mediaType = 'unknown';
                this.mediaTypeCheck = true;
                return;
        }

        /*
        this.flowService.setConfiguration(this.flowId, this.xmlEditor, this.mediaType)
            .pipe(map(config => {
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
                let convert = require('xml-js');
                let obj = JSON.parse(convert.xml2json(err.text(), { compact: true, spaces: 4 }));
                let errMessage = obj.response.message._text;
                this.showInfoMessage(false, errMessage);
            }));
             */
    }

    saveFlows() {
        this.flowService.saveFlows(this.flowId, this.xmlEditor, 'application/xml')
            .pipe(map(response =>  {
                this.configuration = response;
                this.showInfoMessage(true);
            }, (err) => {
                let convert = require('xml-js');
                let obj = JSON.parse(convert.xml2json(err, { compact: true, spaces: 4 }));
                let errMessage = obj.response.message._text;
                this.showInfoMessage(false, errMessage);
            }));
    }

    showInfoMessage(isSuccess, errMessage?: string) {
        isSuccess ? this.isConfigurationSet = true : this.hasLoadError = true;
        this.loadErrorMessage = errMessage ? errMessage : '';
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

    logout() {
        this.router.navigate(['']);
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
