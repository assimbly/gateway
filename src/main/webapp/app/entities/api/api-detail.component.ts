import { Component, OnInit, ViewEncapsulation, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { flowStatusView } from 'app/entities/flow/flow-status';
import { IApi, IApiOperation } from './api.model';
import { ApiService, errorMessage } from './api.service';
import { ApiStatus, apiStatus } from './api-status';
import { ApiRunReport, HandlerFlowState, HandlerFlowsService } from './handler-flows.service';
import { OperationPanelComponent } from './operation-panel.component';
import { downloadText } from './download';

/**
 * An API: its name, base path and version, and its Operations, each answered by its Handler Flow. Clicking an
 * Operation opens it in the side panel. Start and Stop run every Handler Flow; Drafts are skipped.
 */
@Component({
  selector: 'jhi-api-detail',
  templateUrl: './api-detail.component.html',
  styleUrl: './api.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [ReactiveFormsModule, RouterModule, FontAwesomeModule, NgbTooltipModule, OperationPanelComponent],
})
export class ApiDetailComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly handlerFlows = inject(HandlerFlowsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly api = signal<IApi | undefined>(undefined);
  readonly states = signal<Map<number, HandlerFlowState>>(new Map());
  readonly status = signal<ApiStatus | undefined>(undefined);
  /** The Operation in the side panel; `new` while one is being added. */
  readonly selected = signal<IApiOperation | 'new' | undefined>(undefined);
  readonly message = signal<string | undefined>(undefined);
  readonly notice = signal<string | undefined>(undefined);
  readonly running = signal(false);
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
      }
    });
  }

  load(id: number, keepSelection = true): void {
    this.apiService.find(id).subscribe({
      next: api => {
        this.api.set(api);
        this.form.reset({ name: api.name, basePath: api.basePath, versionLabel: api.versionLabel ?? '', description: api.description ?? '' });
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
  }

  saveHeader(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const current = this.api()!;
    const api: IApi = { ...current, ...this.form.getRawValue(), operations: undefined };
    this.saving = true;
    this.message.set(undefined);
    (current.id ? this.apiService.update(api) : this.apiService.create(api)).subscribe({
      next: saved => {
        this.saving = false;
        if (!current.id) {
          this.router.navigate(['/rest-apis', saved.id]);
          return;
        }
        this.api.set(saved);
        this.form.markAsPristine();
        this.notice.set('Saved. Each Handler Flow serves its new path once it is restarted.');
      },
      error: error => {
        this.saving = false;
        this.message.set(errorMessage(error));
      },
    });
  }

  deleteApi(): void {
    const api = this.api()!;
    const count = api.operations?.length ?? 0;
    if (!window.confirm(`Delete the API ${api.name}? Its ${count} ${count === 1 ? 'Operation and its Handler Flow are' : 'Operations and their Handler Flows are'} deleted too.`)) {
      return;
    }
    this.apiService.delete(api.id!).subscribe({
      next: () => this.router.navigate(['/rest-apis']),
      error: error => this.message.set(errorMessage(error)),
    });
  }

  start(): void {
    this.run(this.handlerFlows.start(this.api()!, this.states()), 'Started');
  }

  stop(): void {
    this.run(this.handlerFlows.stop(this.api()!), 'Stopped');
  }

  private run(action: ReturnType<HandlerFlowsService['stop']>, verb: string): void {
    this.running.set(true);
    this.message.set(undefined);
    this.notice.set(undefined);
    action.subscribe({
      next: report => {
        this.running.set(false);
        this.reportRun(report, verb);
        this.refreshStates();
      },
      error: error => {
        this.running.set(false);
        this.message.set(errorMessage(error));
      },
    });
  }

  private reportRun(report: ApiRunReport, verb: string): void {
    const parts = [`${verb} ${report.done} ${report.done === 1 ? 'Handler Flow' : 'Handler Flows'}`];
    if (report.skippedDrafts) {
      parts.push(`skipped ${report.skippedDrafts} ${report.skippedDrafts === 1 ? 'Draft' : 'Drafts'}`);
    }
    this.notice.set(parts.join(', ') + '.');
    if (report.failed.length) {
      this.message.set(report.failed.map(f => `${f.operation.method} ${f.operation.fullPath}: ${f.message}`).join('\n'));
    }
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
