import { Component, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { forkJoin, of, switchMap } from 'rxjs';

import { EmptyState } from 'app/shared/empty-state';
import { SearchToolbar } from 'app/shared/filter';
import { SortState } from 'app/shared/sort';
import { DataTable, DataTableColumn, RowActions, OverflowActionDirective, PrimaryActionDirective, Truncate, sortRows } from 'app/shared/table';
import { IApi } from './api.model';
import { ApiService, errorMessage } from './api.service';
import { ApiStatus, apiStatus } from './api-status';
import { HandlerFlowsService } from './handler-flows.service';
import { downloadText } from './download';

/** Running APIs first, then the ones that are partly or not running, then the ones with an error. */
const STATUS_RANK: Record<string, number> = { started: 0, default: 1, failed: 2 };

/** APIs → the list of APIs, with each API's status summarised from its Handler Flows. */
@Component({
  selector: 'jhi-api-list',
  templateUrl: './api-list.component.html',
  styleUrl: './api.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterModule,
    FontAwesomeModule,
    NgbDropdownModule,
    NgbTooltipModule,
    EmptyState,
    SearchToolbar,
    DataTable,
    RowActions,
    PrimaryActionDirective,
    OverflowActionDirective,
    Truncate,
  ],
})
export class ApiListComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly handlerFlows = inject(HandlerFlowsService);

  readonly apis = signal<IApi[]>([]);
  readonly statuses = signal<Map<number, ApiStatus>>(new Map());
  readonly loading = signal(true);
  readonly message = signal<string | undefined>(undefined);
  searchText = '';
  sortState: SortState = { predicate: 'name', order: 'asc' };

  /** The Version column is dropped while no API has a version label: a column of dashes says nothing. */
  readonly showVersion = computed(() => this.apis().some(api => !!api.versionLabel));

  readonly columns = computed<DataTableColumn[]>(() =>
    [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'basePath', header: 'Base path', sortable: true },
      { key: 'version', header: 'Version', sortable: true },
      { key: 'status', header: 'API status', sortable: true },
      { key: 'operations', header: 'Operations', numeric: true, sortable: true },
      { key: 'actions', header: 'Actions', align: 'end' as const },
    ].filter(column => column.key !== 'version' || this.showVersion()),
  );

  /** With no API at all, the list gives way to an explanation of APIs and how to add the first. */
  get showEmptyState(): boolean {
    return !this.loading() && !this.apis().length;
  }

  ngOnInit(): void {
    this.load();
  }

  get filteredApis(): IApi[] {
    const text = this.searchText.trim().toLowerCase();
    const apis = this.apis().filter(api => !text || api.name.toLowerCase().includes(text) || api.basePath.toLowerCase().includes(text));
    const statuses = this.statuses();
    return sortRows(apis, this.sortState, {
      name: api => api.name,
      basePath: api => api.basePath,
      version: api => api.versionLabel,
      status: api => {
        const tone = statuses.get(api.id!)?.tone;
        return tone === undefined ? undefined : (STATUS_RANK[tone] ?? 1);
      },
      operations: api => api.operationCount ?? 0,
    });
  }

  load(): void {
    this.loading.set(true);
    this.apiService
      .query()
      .pipe(
        switchMap(apis => {
          this.apis.set(apis);
          this.loading.set(false);
          return apis.length ? forkJoin(apis.map(api => this.handlerFlows.states(api))) : of([]);
        }),
      )
      .subscribe({
        next: states => this.statuses.set(new Map(this.apis().map((api, i) => [api.id!, apiStatus([...states[i].values()])]))),
        error: () => this.loading.set(false),
      });
  }

  exportApi(api: IApi, format: 'yaml' | 'json'): void {
    this.apiService.exportDocument(api.id!, format).subscribe({
      next: ({ text, fileName }) => downloadText(text, fileName, format === 'json' ? 'application/json' : 'application/yaml'),
      error: error => this.message.set(errorMessage(error)),
    });
  }

  deleteApi(api: IApi): void {
    const count = api.operationCount ?? api.operations?.length ?? 0;
    if (!window.confirm(`Delete the API ${api.name}? Its ${count} ${count === 1 ? 'Operation and its Handler Flow are' : 'Operations and their Handler Flows are'} deleted too.`)) {
      return;
    }
    this.apiService.delete(api.id!).subscribe({
      next: () => this.load(),
      error: error => this.message.set(errorMessage(error)),
    });
  }
}
