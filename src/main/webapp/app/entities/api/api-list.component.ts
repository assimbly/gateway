import { Component, OnInit, ViewEncapsulation, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { forkJoin, of, switchMap } from 'rxjs';

import { SearchToolbar } from 'app/shared/filter';
import { DataTable, DataTableColumn, RowActions, OverflowActionDirective, Truncate } from 'app/shared/table';
import { IApi } from './api.model';
import { ApiService, errorMessage } from './api.service';
import { ApiStatus, apiStatus } from './api-status';
import { HandlerFlowsService } from './handler-flows.service';
import { downloadText } from './download';

/** APIs → the list of APIs, with each API's status summarised from its Handler Flows. */
@Component({
  selector: 'jhi-api-list',
  templateUrl: './api-list.component.html',
  styleUrl: './api.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterModule, FontAwesomeModule, NgbDropdownModule, NgbTooltipModule, SearchToolbar, DataTable, RowActions, OverflowActionDirective, Truncate],
})
export class ApiListComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly handlerFlows = inject(HandlerFlowsService);

  readonly apis = signal<IApi[]>([]);
  readonly statuses = signal<Map<number, ApiStatus>>(new Map());
  readonly loading = signal(true);
  readonly message = signal<string | undefined>(undefined);
  searchText = '';

  readonly columns: DataTableColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'basePath', header: 'Base path' },
    { key: 'version', header: 'Version' },
    { key: 'status', header: 'API status' },
    { key: 'operations', header: 'Operations', numeric: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  ngOnInit(): void {
    this.load();
  }

  get filteredApis(): IApi[] {
    const text = this.searchText.trim().toLowerCase();
    return this.apis().filter(api => !text || api.name.toLowerCase().includes(text) || api.basePath.toLowerCase().includes(text));
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
