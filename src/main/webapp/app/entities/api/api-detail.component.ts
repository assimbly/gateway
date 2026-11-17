import { Component, ElementRef, Injector, OnInit, ViewEncapsulation, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule, NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, firstValueFrom, forkJoin, of, tap } from 'rxjs';

import { confirmChoice } from 'app/entities/flow/editor/confirm-dialog.component';
import { flowStatusView } from 'app/entities/flow/flow-status';
import { SaveShortcutDirective } from 'app/shared/keyboard';
import { IApi, IApiHandler, IApiOperation, handlerFlowQueryParams } from './api.model';
import { ApiService, errorMessage } from './api.service';
import { ApiStatus, apiStatus } from './api-status';
import { HandlerFlowState, HandlerFlowsService } from './handler-flows.service';
import { OperationPanelComponent } from './operation-panel.component';
import { operationUrl } from './operation-url';
import { downloadText } from './download';

/**
 * An API: its name, base path and version, and its Operations, each answered by its Handler Flow. Clicking an
 * Operation opens it in the side panel. The Handler Flows are started and stopped on the Flows page; an API is a design.
 */
@Component({
  selector: 'jhi-api-detail',
  templateUrl: './api-detail.component.html',
  styleUrl: './api.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    FontAwesomeModule,
    NgbDropdownModule,
    NgbTooltipModule,
    OperationPanelComponent,
    SaveShortcutDirective,
  ],
})
export class ApiDetailComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly handlerFlows = inject(HandlerFlowsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly modalService = inject(NgbModal);
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly panel = viewChild(OperationPanelComponent);

  readonly api = signal<IApi | undefined>(undefined);
  readonly states = signal<Map<number, HandlerFlowState>>(new Map());
  readonly status = signal<ApiStatus | undefined>(undefined);
  /** The Operation in the side panel; `new` while one is being added. */
  readonly selected = signal<IApiOperation | 'new' | undefined>(undefined);
  readonly message = signal<string | undefined>(undefined);
  readonly notice = signal<string | undefined>(undefined);
  /** The Handler Flows by Flow id, for the runtime path of each Operation. */
  readonly handlers = signal<Record<number, IApiHandler>>({});
  readonly listenerUrl = signal<string | undefined>(undefined);
  saving = false;

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    basePath: new FormControl('/', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\/[^{}]*$/)] }),
    versionLabel: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  get isNew(): boolean {
    return !this.api()?.id;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.load(Number(id));
      } else {
        this.api.set({ name: '', basePath: '/', operations: [] });
        this.form.reset({ name: '', basePath: '/', versionLabel: '1.0', description: '' });
        // a new API starts with its name; the field is there once the API is rendered
        afterNextRender(() => this.nameInput()?.nativeElement.focus(), { injector: this.injector });
      }
    });
  }

  load(id: number, keepSelection = true): void {
    this.apiService.find(id).subscribe({
      next: api => {
        this.api.set(api);
        this.form.reset({
          name: api.name,
          basePath: api.basePath,
          versionLabel: api.versionLabel ?? '',
          description: api.description ?? '',
        });
        const selected = this.selected();
        if (keepSelection && selected && selected !== 'new') {
          this.selected.set(api.operations?.find(o => o.id === selected.id));
        }
        this.refreshStates();
      },
      error: error => this.message.set(errorMessage(error)),
    });
  }

  refreshStates(): void {
    const api = this.api();
    if (!api?.id) {
      return;
    }
    this.handlerFlows.states(api).subscribe(states => {
      this.states.set(states);
      this.status.set(apiStatus([...states.values()]));
    });
    // The runtime path has the tenant's prefix, so it comes from the Gateway.
    forkJoin([this.apiService.handlers(), this.apiService.listenerUrl()]).subscribe({
      next: ([handlers, listener]) => {
        this.handlers.set(handlers);
        this.listenerUrl.set(listener);
      },
      error: () => undefined,
    });
  }

  saveHeader(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const isNew = this.isNew;
    this.saveHeaderRequest().subscribe({
      next: saved => {
        if (isNew) {
          this.router.navigate(['/rest-apis', saved.id]);
          return;
        }
        this.notice.set('Saved. Each Handler Flow serves its new path once it is restarted.');
      },
      error: error => this.message.set(errorMessage(error)),
    });
  }

  /** Saves the name, base path, version and description; the form is pristine once they are saved. */
  private saveHeaderRequest(): Observable<IApi> {
    const current = this.api()!;
    const api: IApi = { ...current, ...this.form.getRawValue(), operations: undefined };
    this.saving = true;
    this.message.set(undefined);
    return (current.id ? this.apiService.update(api) : this.apiService.create(api)).pipe(
      tap({
        next: saved => {
          this.saving = false;
          this.form.markAsPristine();
          if (current.id) {
            this.api.set(saved);
          }
        },
        error: () => (this.saving = false),
      }),
    );
  }

  /** Whether the API form or the Operation in the panel has changes that are not saved yet. */
  get hasUnsavedChanges(): boolean {
    return this.form.dirty || !!this.panel()?.hasUnsavedChanges();
  }

  /** Leaving with unsaved changes asks first, as the Flow editor does. */
  async canDeactivate(): Promise<boolean> {
    if (!this.hasUnsavedChanges) {
      return true;
    }
    const choice = await confirmChoice(this.modalService, 'Unsaved changes', 'This API has changes that are not saved yet.', [
      { value: 'stay', label: 'Keep editing', style: 'secondary' },
      { value: 'leave', label: 'Leave without saving', style: 'danger' },
      { value: 'save', label: 'Save and leave', style: 'primary', icon: 'save' },
    ]);
    if (choice === 'save') {
      return this.saveBeforeLeaving();
    }
    return choice === 'leave';
  }

  /** Saves the API form and the Operation in the panel, whichever has changes; true once both are saved. */
  private saveBeforeLeaving(): Promise<boolean> {
    if (this.form.dirty && this.form.invalid) {
      this.form.markAllAsTouched();
      return Promise.resolve(false);
    }
    const panel = this.panel();
    const header = this.form.dirty ? this.saveHeaderRequest() : of(undefined);
    const operation = panel?.hasUnsavedChanges() ? panel.saveRequest() : of(undefined);
    return firstValueFrom(forkJoin([header, operation])).then(
      () => true,
      error => {
        this.message.set(errorMessage(error));
        return false;
      },
    );
  }

  deleteApi(): void {
    const api = this.api()!;
    const count = api.operations?.length ?? 0;
    const message = `Delete the API ${api.name}? Its ${count} ${count === 1 ? 'Operation and its Handler Flow are' : 'Operations and their Handler Flows are'} deleted too.`;
    void confirmChoice(this.modalService, 'Delete API', message, [
      { value: 'cancel', label: 'Cancel', style: 'secondary' },
      { value: 'delete', label: 'Delete', style: 'danger', icon: 'trash' },
    ]).then(choice => {
      if (choice !== 'delete') {
        return;
      }
      this.apiService.delete(api.id!).subscribe({
        next: () => {
          // a deleted API has nothing left to save
          this.form.markAsPristine();
          this.selected.set(undefined);
          this.router.navigate(['/rest-apis']);
        },
        error: error => this.message.set(errorMessage(error)),
      });
    });
  }

  exportApi(format: 'yaml' | 'json'): void {
    this.apiService.exportDocument(this.api()!.id!, format).subscribe({
      next: ({ text, fileName }) => downloadText(text, fileName, format === 'json' ? 'application/json' : 'application/yaml'),
      error: error => this.message.set(errorMessage(error)),
    });
  }

  select(operation: IApiOperation): void {
    this.selected.set(operation);
  }

  newOperation(): void {
    this.selected.set('new');
  }

  isSelected(operation: IApiOperation): boolean {
    const selected = this.selected();
    return selected !== 'new' && selected?.id === operation.id;
  }

  stateOf(operation: IApiOperation): HandlerFlowState | undefined {
    return operation.handlerFlowId ? this.states().get(operation.handlerFlowId) : undefined;
  }

  stateLabel(state: HandlerFlowState | undefined): string {
    return state ? flowStatusView(state.status, state.draft).label : '…';
  }

  /** The full URL the Operation is served on, once known. */
  urlOf(operation: IApiOperation): string | undefined {
    const listener = this.listenerUrl();
    const handler = operation.handlerFlowId ? this.handlers()[operation.handlerFlowId] : undefined;
    return listener && handler ? operationUrl(listener, handler.runtimePath) : undefined;
  }

  handlerFlowQueryParams(operation: IApiOperation): Record<string, unknown> {
    return handlerFlowQueryParams(operation, this.api()?.id);
  }

  onSaved(operation: IApiOperation): void {
    this.selected.set(operation);
    this.load(this.api()!.id!, false);
  }

  onDeleted(): void {
    this.selected.set(undefined);
    this.load(this.api()!.id!, false);
  }

  methodClass(method: string): string {
    return `api-method api-method--${method.toLowerCase()}`;
  }
}
