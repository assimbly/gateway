import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, defer, forkJoin, from, of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { ThemeService } from 'app/core/theme';
import { Components } from 'app/shared/camel/component-type';
import { Connections } from 'app/shared/camel/connections';
import { Connection } from 'app/shared/model/connection.model';
import { IStep, StepType } from 'app/shared/model/step.model';
import { ConnectionDialogComponent } from 'app/entities/connection/connection-dialog.component';
import { ConnectionPopupService } from 'app/entities/connection/connection-popup.service';
import { ConnectionService } from 'app/entities/connection/connection.service';
import { StepService } from 'app/entities/step/step.service';

import SendMessageEditor from 'app/shared/send/send-message-editor';
import SendResultPanel from 'app/shared/send/send-result';
import SendToolbar from 'app/shared/send/send-toolbar';
import { focusFirstInvalid } from 'app/shared/send/send-form';
import { SendHeader, filledHeaders, headersToTemplateJson } from 'app/shared/send/send-headers';
import { SendState, sendErrorText } from 'app/shared/send/send-state';
import { BodyMode, SendMessage, UploadedMessages, detectResponseMode } from 'app/shared/send/send-upload';

import { ApiService } from 'app/entities/api/api.service';
import { FlowService } from '../flow.service';
import { sourceStepOf } from '../flow-status';
import { RestTarget, restHostOf, restTargetOf } from './rest-target';

/** The answer to a message that was sent with the exchange pattern Request and Reply. */
export interface FlowResponse {
    ok: boolean;
    status: number;
    body: string;
    ms: number;
}

type SendOutcome = FlowResponse & { error?: unknown };

@Component({
    selector: 'jhi-flow-message-sender',
    templateUrl: './flow-message-sender.component.html',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        NgSelectModule,
        CodemirrorModule,
        SendToolbar,
        SendResultPanel,
        SendMessageEditor,
    ],
    host: {
        '(document:keydown.control.enter)': 'send()',
        '(document:keydown.meta.enter)': 'send()',
    },
})
export class FlowMessageSenderComponent implements OnInit, OnDestroy {
    private readonly element = inject(ElementRef<HTMLElement>);
    private readonly route = inject(ActivatedRoute);
    private readonly flowService = inject(FlowService);
    private readonly apiService = inject(ApiService);
    private readonly stepService = inject(StepService);
    private readonly connectionService = inject(ConnectionService);
    private readonly connectionPopupService = inject(ConnectionPopupService);
    private readonly modalService = inject(NgbModal);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly components = inject(Components);
    private readonly connectionsList = inject(Connections);
    readonly themeService = inject(ThemeService);

    readonly state = new SendState();

    // the message
    readonly body = signal('');
    readonly bodyMode = signal<BodyMode>('text');
    readonly headers = signal<SendHeader[]>([]);

    // the answer to the last message that was sent with Request and Reply
    readonly response = signal<FlowResponse | null>(null);
    readonly responseOptions = computed(() => ({
        lineNumbers: true,
        gutters: ['CodeMirror-linenumbers'],
        lineWrapping: true,
        theme: this.themeService.editorTheme(),
        mode: detectResponseMode(this.response()?.body),
        readOnly: true,
        cursorBlinkRate: -1,
    }));

    messageSenderForm: FormGroup;
    finished = false;
    // true when the page was opened from a Flow (query param flowId), false when opened from the sidebar
    openedFromFlow = false;

    readonly exchangePatterns = [
        { value: 'RequestAndReply', label: 'Request and reply' },
        { value: 'FireAndForget', label: 'Fire and forget' },
    ];

    producerComponentsNames: string[] = [];
    connections: Connection[] = [];
    filterConnection: Connection[] = [];
    steps: IStep[] = [];
    URIList: string[] = [];

    componentOptions: any[] = [];
    hoveredOption: any = null;

    connectionType = '';
    enableConnection = false;
    componentTypeCamelLink = '';
    componentDescription = '';
    uriPlaceholder = '';

    modalRef: NgbModalRef | null;

    private camelDocUrl = '';
    private optionsRequest = 0;
    private destroyed = false;
    private readonly uploaded = new UploadedMessages(this.body, this.bodyMode, this.headers);

    get isSending(): boolean {
        return this.state.sending();
    }

    get options(): FormArray {
        return this.messageSenderForm.controls.options as FormArray;
    }

    get subtitle(): string {
        const component = this.messageSenderForm?.controls.componentType.value;
        const uri = this.messageSenderForm?.controls.uri.value;
        return component && uri ? 'To ' + this.targetOf(component, uri) : 'Choose a component and a path to send to';
    }

    ngOnInit() {
        this.setComponents();
        this.load();
    }

    ngOnDestroy() {
        this.destroyed = true;
    }

    private load() {
        forkJoin([
            this.flowService.getCamelDocUrl(),
            this.connectionService.getAllConnections(),
            this.stepService.query(),
        ]).subscribe(([camelDocUrl, connections, steps]) => {
            this.camelDocUrl = camelDocUrl.body ?? '';
            this.connections = connections.body ?? [];
            this.steps = steps.body ?? [];

            this.initializeForm();
            this.setComponentType('file');

            const flowId = Number(this.route.snapshot.queryParamMap.get('flowId'));
            if (flowId) {
                this.openedFromFlow = true;
                this.prefillFromFlowSource(flowId);
            }

            this.finished = true;
            this.cdr.detectChanges();
        });
    }

    private setComponents() {
        this.producerComponentsNames = this.components.types
            .filter(component => component.consumerOnly === false)
            .map(component => component.name)
            .sort();
    }

    private initializeForm() {
        this.messageSenderForm = new FormGroup({
            componentType: new FormControl('file', Validators.required),
            uri: new FormControl<string | null>(null, Validators.required),
            options: new FormArray([this.initializeOption()]),
            connection: new FormControl('', Validators.required),
            exchangepattern: new FormControl('RequestAndReply'),
        });
    }

    private initializeOption(key: string | null = null, value: string | null = null): FormGroup {
        return new FormGroup({
            key: new FormControl(key),
            value: new FormControl(value),
            defaultValue: new FormControl(''),
        });
    }

    /** Sends the test message to the Flow's Source: its Component, path, Options and Connection. */
    private prefillFromFlowSource(flowId: number): void {
        this.flowService.find(flowId).subscribe(response => {
            const source = sourceStepOf(response.body?.steps);
            if (!source?.componentType) {
                return;
            }
            this.setComponentType(source.componentType);
            this.messageSenderForm.controls.uri.setValue(source.uri || null);
            this.setOptionsFromString(source.options);
            if (source.connectionId) {
                this.messageSenderForm.controls.connection.setValue(source.connectionId);
            }
            this.cdr.detectChanges();

            const restTarget = source.componentType.toLowerCase() === 'rest' ? restTargetOf(source.uri, source.options) : undefined;
            if (restTarget) {
                this.prefillRest(restTarget);
            }
        });
    }

    /**
     * The Source of an API Operation keeps its method and path as Options. The `rest` Component sends to
     * `rest:method:path`, so they go in the path, and the Component is told where the runtime's REST listener is.
     */
    private prefillRest(target: RestTarget): void {
        this.messageSenderForm.controls.uri.setValue(target.uri);
        this.setOptionsFromString(target.options);
        this.cdr.detectChanges();

        this.apiService.listenerUrl().subscribe({
            next: listenerUrl => {
                const host = restHostOf(listenerUrl);
                if (host && !this.hasOption('host')) {
                    this.setOptionsFromString([target.options, `host=${host}`].filter(Boolean).join('&'));
                    this.cdr.detectChanges();
                }
            },
            error: () => undefined,
        });
    }

    private hasOption(name: string): boolean {
        return this.options.controls.some(option => option.get('key')?.value === name && !!option.get('value')?.value);
    }

    /** Selects a component: its documentation, the paths and options that fit it, and the connections of its type. */
    setComponentType(name: string) {
        const form = this.messageSenderForm.controls;
        const componentType = name.toLowerCase();
        const camelComponentType = this.components.getCamelComponentType(componentType);
        const type = this.components.types.find(candidate => candidate.name === name);

        form.componentType.setValue(name);
        form.connection.setValue('');

        this.connectionType = this.connectionsList.getConnectionType(componentType);
        this.enableConnection = !!this.connectionType;
        this.filterConnection = this.connections.filter(connection => connection.type === this.connectionType);

        this.componentTypeCamelLink = this.camelDocUrl + '/' + camelComponentType + '-component.html';
        this.uriPlaceholder = type?.syntax ?? '';
        this.componentDescription = type?.description ?? '';

        this.loadComponentOptions(camelComponentType);
        this.enableFields(name);
        this.setURIlist(name);
    }

    private loadComponentOptions(camelComponentType: string) {
        const request = ++this.optionsRequest;
        this.flowService
            .getComponentOptions(camelComponentType, StepType.TO.toString().toLowerCase())
            .pipe(map(response => response.body))
            .subscribe({
                next: data => {
                    if (request !== this.optionsRequest) {
                        return;
                    }
                    const properties = data?.properties ?? {};
                    this.componentOptions = Object.keys(properties)
                        .map(key => ({ ...properties[key], name: key }))
                        .sort((a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()));
                    this.ensureOptionItems();
                    this.cdr.markForCheck();
                },
                error: () => {
                    if (request === this.optionsRequest) {
                        this.componentOptions = [];
                        this.ensureOptionItems();
                    }
                },
            });
    }

    private enableFields(componentName: string) {
        const form = this.messageSenderForm.controls;
        if (componentName === 'wastebin') {
            form.uri.disable();
            form.options.disable();
            form.connection.disable();
            return;
        }
        form.uri.enable();
        form.options.enable();
        if (this.connectionType) {
            form.connection.enable();
        } else {
            form.connection.disable();
        }
    }

    /** The paths that are in use by existing steps of the selected component. */
    private setURIlist(componentName: string) {
        const uris = this.steps
            .filter(step => step.componentType?.toLowerCase() === componentName.toLowerCase() && !!step.uri)
            .map(step => step.uri as string);
        this.URIList = Array.from(new Set(uris));
    }

    openComponentDocs(): void {
        if (this.componentTypeCamelLink) {
            window.open(this.componentTypeCamelLink, '_blank', 'noopener,noreferrer');
        }
    }

    // options of the endpoint

    addOption() {
        this.options.push(this.initializeOption());
    }

    removeOption(index: number) {
        if (this.options.length === 1) {
            this.options.at(0).reset({ key: null, value: null, defaultValue: '' });
        } else {
            this.options.removeAt(index);
        }
    }

    private setOptionsFromString(optionsString: string | null | undefined) {
        this.options.clear();
        (optionsString ?? '')
            .split('&')
            .filter(option => option.includes('='))
            .forEach(option => {
                const [key, ...value] = option.split('=');
                this.options.push(this.initializeOption(key, value.join('=')));
            });
        if (this.options.length === 0) {
            this.options.push(this.initializeOption());
        }
        this.ensureOptionItems();
    }

    changeOptionSelection(selectedOption: any, optionIndex: number) {
        const selectedName = typeof selectedOption === 'string' ? selectedOption : selectedOption?.name;
        if (!selectedName) {
            return;
        }
        this.ensureOptionItem(selectedName);

        const componentOption = this.componentOptions.find(option => option.name === selectedName);
        const defaultValue = componentOption?.defaultValue;
        this.options.at(optionIndex).get('defaultValue')?.setValue(defaultValue ? 'Default Value: ' + defaultValue : '');
    }

    addOptionTag(name: string): any {
        return { name, displayName: name, description: 'Custom option', group: 'custom', type: 'string' };
    }

    /** The select can only show an option that is in its items, also an option that is not known for the component. */
    private ensureOptionItems() {
        this.options.controls.forEach(option => this.ensureOptionItem(option.get('key')?.value));
    }

    private ensureOptionItem(name: string | null | undefined) {
        if (name && !this.componentOptions.some(option => option.name === name)) {
            this.componentOptions = [
                ...this.componentOptions,
                { name, displayName: name, description: 'Custom option', group: 'custom', type: 'string' },
            ];
        }
    }

    onOptionHover(item: any): void {
        this.hoveredOption = item;
        this.cdr.detectChanges();
    }

    clearOptionHover(): void {
        this.hoveredOption = null;
        this.cdr.detectChanges();
    }

    // path editor

    openModal(templateRef: TemplateRef<any>) {
        this.modalRef = this.modalService.open(templateRef, { size: 'xl' });
    }

    private pathOptionsCache?: Record<string, unknown>;
    private pathOptionsKey = '';

    /** The same path editor as in the visual Flow editor. */
    pathEditorOptions(): Record<string, unknown> {
        const theme = this.themeService.editorTheme();
        const placeholder = this.uriPlaceholder ?? '';
        const key = `${theme}|${placeholder}`;
        if (this.pathOptionsCache && this.pathOptionsKey === key) {
            return this.pathOptionsCache;
        }
        this.pathOptionsKey = key;
        this.pathOptionsCache = {
            lineNumbers: true,
            gutters: ['CodeMirror-linenumbers'],
            lineWrapping: true,
            theme,
            mode: 'text',
            placeholder,
        };
        return this.pathOptionsCache;
    }

    refreshCodeMirror(editor: { codeMirror?: { refresh: () => void } }): void {
        const codeMirror = editor?.codeMirror;
        if (!codeMirror) {
            return;
        }
        const refresh = () => codeMirror.refresh();
        requestAnimationFrame(() => {
            refresh();
            setTimeout(refresh);
        });
    }

    cancelModal(): void {
        if (this.modalRef) {
            this.modalRef.dismiss();
            this.modalRef = null;
        }
    }

    // connection

    get connectionButtonTitle(): string {
        return this.messageSenderForm.controls.connection.value ? 'Edit connection' : 'Create connection';
    }

    createOrEditConnection() {
        const control = this.messageSenderForm.controls.connection;
        const connectionId = control.value || undefined;

        this.connectionPopupService.open(ConnectionDialogComponent as Component, connectionId).then(modalRef => {
            modalRef.componentInstance.connectionType = this.connectionType;
            const done = (outcome: any) => this.afterConnectionDialog(typeof outcome === 'object' ? outcome?.id : undefined);
            modalRef.result.then(done, done);
        });
    }

    private afterConnectionDialog(id?: number) {
        this.connectionService.getAllConnections().subscribe(response => {
            this.connections = response.body ?? [];
            this.filterConnection = this.connections.filter(connection => connection.type === this.connectionType);
            if (id) {
                this.messageSenderForm.controls.connection.setValue(id);
            }
            this.cdr.detectChanges();
        });
    }

    // sending

    private targetOf(componentType: string, uri: string): string {
        return componentType.toLowerCase() + '://' + uri;
    }

    private requestUri(): string {
        const form = this.messageSenderForm.controls;
        const options = this.options.controls
            .map(option => ({ key: option.get('key')?.value, value: option.get('value')?.value }))
            .filter(option => option.key && option.value)
            .map(option => `${option.key}=${option.value}`)
            .join('&');
        const target = this.targetOf(form.componentType.value, form.uri.value ?? '');
        return options ? `${target}?${options}` : target;
    }

    send() {
        if (this.destroyed || this.state.sending()) {
            return;
        }
        if (!this.messageSenderForm.valid) {
            this.messageSenderForm.markAllAsTouched();
            focusFirstInvalid(this.element.nativeElement);
            return;
        }

        const form = this.messageSenderForm.controls;
        const uri = this.requestUri();
        const exchangePattern: string = form.exchangepattern.value;
        const connectionId = form.connection.enabled && form.connection.value ? String(form.connection.value) : '';
        const messages = this.uploaded.messagesToSend();

        this.state.start(messages.length, this.targetOf(form.componentType.value, form.uri.value ?? ''));
        this.response.set(null);

        const keys$: Observable<string> = connectionId
            ? this.connectionService.getConnectionKeys(parseInt(connectionId, 10)).pipe(map(res => JSON.stringify(res.body)))
            : of('');

        keys$
            .pipe(
                // one message after the other, so the answers come in the order of the messages
                switchMap(connectionKeys =>
                    from(messages).pipe(concatMap(message => this.sendOne(uri, exchangePattern, connectionId, connectionKeys, message)))
                )
            )
            .subscribe({
                next: outcome => this.handleOutcome(outcome, exchangePattern),
                error: error => messages.forEach(() => this.state.fail(error)),
            });
    }

    private sendOne(
        uri: string,
        exchangePattern: string,
        connectionId: string,
        connectionKeys: string,
        message: SendMessage
    ): Observable<SendOutcome> {
        // the headers of the page apply to every message, the headers of an uploaded message override them
        const rows = [...this.headers(), ...message.headers];
        const header = filledHeaders(rows).length > 0 ? JSON.stringify(headersToTemplateJson(rows)) : '';

        return defer(() => {
            const start = Date.now();
            const request$: Observable<HttpResponse<string>> =
                exchangePattern === 'FireAndForget'
                    ? this.flowService.send(1, uri, '0', connectionId, connectionKeys, header, '1', message.body)
                    : this.flowService.sendRequest(1, uri, '0', connectionId, connectionKeys, header, message.body);

            return request$.pipe(
                map((res): SendOutcome => ({ ok: true, status: res.status, body: res.body ?? '', ms: Date.now() - start })),
                catchError((error: HttpErrorResponse) =>
                    of<SendOutcome>({ ok: false, status: error.status, body: sendErrorText(error), ms: Date.now() - start, error })
                )
            );
        });
    }

    private handleOutcome(outcome: SendOutcome, exchangePattern: string) {
        if (outcome.ok) {
            this.state.succeed();
        } else {
            this.state.fail(outcome.error);
        }
        if (exchangePattern === 'RequestAndReply') {
            this.response.set(outcome);
        }
    }

    // upload

    goBack() {
        window.history.back();
    }

    async onFile(file: File) {
        this.state.reset();
        await this.uploaded.addFile(file);
    }
}
