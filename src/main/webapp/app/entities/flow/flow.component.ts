import { ChangeDetectorRef, Component, OnInit, OnDestroy, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, forkJoin, interval } from 'rxjs';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

import { SortState, sortParams } from 'app/shared/sort';

import { EventManager } from 'app/core/util/event-manager.service';
import { ParseLinks } from 'app/core/util/parse-links.service';
import { AlertService } from 'app/core/util/alert.service';

import { IFlow } from 'app/shared/model/flow.model';
import { AccountService } from 'app/core/auth/account.service';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { FlowService } from './flow.service';
import { IIntegration, GatewayType, EnvironmentType } from 'app/shared/model/integration.model';
import { IntegrationService } from 'app/entities/integration/integration.service';
import { EmptyState } from 'app/shared/empty-state';
import { SearchToolbar } from 'app/shared/filter';
import { DataTable, DataTableColumn } from 'app/shared/table';
import { FlowRowComponent } from './flow-row.component';
import { FlowRuntime } from './flow-status';
import { FlowSearchByNamePipe } from './flow.searchbyname.pipe';
import { FlowTypeChoicesComponent } from './flow-type-choices.component';
import { TutorialPanelState } from 'app/tutorials/tutorial-panel.state';
import { NewFlowDialogComponent } from './new-flow-dialog.component';
import { FluxygenExportDialogComponent } from './fluxygen-export-dialog.component';
import { ImportDialogComponent } from 'app/entities/import/import-dialog.component';
import { ApiService } from 'app/entities/api/api.service';
import { IApiHandler } from 'app/entities/api/api.model';

@Component({
  selector: 'jhi-flow',
  templateUrl: './flow.component.html',
  imports: [CommonModule, RouterModule, FontAwesomeModule, EmptyState, SearchToolbar, DataTable, FlowRowComponent, FlowTypeChoicesComponent],
})
export class FlowComponent implements OnInit, OnDestroy {
  integrations: IIntegration[];
  integration: IIntegration;
  flows: IFlow[] = [];
  flow: IFlow;
  currentAccount: any;
  itemsPerPage: number;
  links: any;
  page: any;
  sortState: SortState = { predicate: 'name', order: 'asc' };
  queryCount: any;
  totalItems = -1;
  integrationExists: boolean;
  multipleIntegrations = false;
  finished = false;

  singleIntegrationName: string;
  singleIntegrationId: number;
  singleIntegrationStage: string;

  configuredIntegration: IIntegration;
  indexIntegration: number;

  flowActions = ['start', 'stop', 'pause', 'restart', 'resume'];
  selectedAction: string;
  test: any;
  searchText = '';
  flowsLoading = true;
  flowsLoadFailed = false;
  readonly columns: DataTableColumn[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'completed', header: 'Completed', numeric: true, sortable: true },
    { key: 'failed', header: 'Failed', numeric: true, sortable: true },
    { key: 'stats', header: 'Stats' },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];
  /** The Handler Flows by Flow id, to mark them with their API and Operation. */
  handlers: Record<number, IApiHandler> = {};
  /** The runtime state of the Flows by Flow id, as their rows report it. */
  runtimes: Record<number, FlowRuntime> = {};
  private readonly apiService = inject(ApiService);
  readonly tutorialPanel = inject(TutorialPanelState);
  private readonly searchPipe = new FlowSearchByNamePipe();
  private readonly eventSubscriptions = new Subscription();
  private readonly polls = new Subscription();

  @ViewChildren(FlowRowComponent) private flowRows: QueryList<FlowRowComponent>;

  constructor(
    protected flowService: FlowService,
    protected alertService: AlertService,
    protected eventManager: EventManager,
    protected parseLinks: ParseLinks,
    protected accountService: AccountService,
    protected integrationService: IntegrationService,
    protected changeDetector: ChangeDetectorRef,
    protected modalService: NgbModal,
  ) {
    this.flows = [];
    this.itemsPerPage = ITEMS_PER_PAGE + 5;
    this.page = 0;
    this.links = {
      last: 0,
    };
  }

  loadFlows() {
    if (this.integrations.length > 1) {
      this.getFlowsForSelectedIntegration(this.integrations[this.indexIntegration].id);
    } else {
      this.flowService
        .query({
          page: this.page,
          size: this.itemsPerPage,
          sort: this.sort(),
        })
        .subscribe(
          (res: HttpResponse<IFlow[]>) => this.onSuccess(res.body, res.headers),
          (res: HttpErrorResponse) => this.onError(res.message)
        );
    }
  }

  getFlowsForSelectedIntegration(event) {
    let id = (event.target as HTMLSelectElement).value as string;
    this.flowService
      .getFlowByIntegrationId(Number(id), {
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sort(),
      })
      .subscribe(
        (res: HttpResponse<IFlow[]>) => this.onSuccess(res.body, res.headers),
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }

  // The Flows shown stay until the new list arrives, so the toolbar doesn't flicker away on a refresh.
  reset() {
    this.page = 0;
    this.flowsLoading = true;
    this.flowsLoadFailed = false;
    this.loadFlows();
  }

  loadPage(page) {
    this.page = 0; // page;
    this.itemsPerPage = this.itemsPerPage + 5;
    this.loadFlows();
  }

  ngOnInit() {
    this.getIntegrations();
    this.loadHandlers();
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });
    this.finished = true;
    this.registerChangeInFlows();
    this.registerChangeCreatedIntegration();
    this.registerDeletedFlows();
    this.polls.add(interval(10000).subscribe(() => this.flowRows?.forEach(row => row.pollMessages())));
    this.polls.add(interval(10000).subscribe(() => this.flowRows?.forEach(row => row.pollAlerts())));
  }

  loadHandlers(): void {
    this.apiService.handlers().subscribe(handlers => (this.handlers = handlers));
  }

  ngAfterViewInit() {
    this.finished = true;
  }

  ngOnDestroy() {
    this.eventSubscriptions.unsubscribe();
    this.polls.unsubscribe();
  }

  getIntegrations(): void {
    forkJoin(this.flowService.getIntegrationName(), this.integrationService.query()).subscribe(([integrationName, integrations]) => {
      this.integrations = integrations.body;
      this.checkIntegrationType(this.integrations, integrationName.body);

      if (!this.integrationExists) {
        console.log('Creating integration');
        this.integration = new Object();
        this.integration.name = integrationName.body;
        this.integration.type = GatewayType.FULL;
        this.integration.environmentName = 'Dev1';
        this.integration.stage = EnvironmentType.DEVELOPMENT;
        this.integration.defaultFromComponentType = 'file';
        this.integration.defaultToComponentType = 'file';
        this.integration.defaultErrorComponentType = 'file';

        this.integrationService.create(this.integration).subscribe(integration => {
          console.log('integration created');
          this.integration = integration.body;
          this.integrations.push(this.integration);
          this.integrationExists = true;
          this.singleIntegrationName = integration.body.name;
          this.singleIntegrationId = integration.body.id;
          this.singleIntegrationStage = integration.body.stage ? integration.body.stage.toString().toLowerCase() : '';
          this.flowsLoading = false;
          this.changeDetector.detectChanges();
        });
      } else {
        this.loadFlows();
        if (!this.multipleIntegrations) {
          this.singleIntegrationName = this.integrations[this.indexIntegration].name;
          this.singleIntegrationId = this.integrations[this.indexIntegration].id;
          this.singleIntegrationStage = this.integrations[this.indexIntegration].stage
            ? this.integrations[this.indexIntegration].stage.toString().toLowerCase()
            : '';
        }
      }
    });
  }

  checkIntegrationType(integrations: IIntegration[], integrationName: String): void {
    if (integrationName === 'default') {
      this.integrationExists = integrations.length > 0;
      this.indexIntegration = 0;
      this.multipleIntegrations = integrations.length > 1;
    } else {
      this.multipleIntegrations = false;
      this.configuredIntegration = integrations.find(integration => integration.name === integrationName);
      this.indexIntegration = integrations.findIndex(integration => integration.name == integrationName);
      this.integrationExists = this.indexIntegration >= 0;
      if (!this.integrationExists) {
        this.indexIntegration = 0;
      }
    }
  }

  /** An empty Gateway shows how to create the first Flow instead of the list. */
  get showEmptyState(): boolean {
    return !this.flowsLoading && !this.flowsLoadFailed && !this.flows.length;
  }

  /** Filter, Add and Refresh only make sense once there is a Flow; a failed load keeps Refresh to try again. */
  get hasFlows(): boolean {
    return this.flows.length > 0 || this.flowsLoadFailed;
  }

  get filteredFlows(): IFlow[] {
    return this.searchPipe.transform(
      this.flows ?? [],
      this.searchText,
      this.sortState.order === 'asc',
      this.sortState.predicate,
      this.runtimes,
    );
  }

  /** A row reports its Flow's state when it changes, so the list can be sorted on it. */
  onRuntimeChange(id: number, runtime: FlowRuntime): void {
    this.runtimes = { ...this.runtimes, [id]: runtime };
  }

  get integrationId(): number | undefined {
    return this.integrations?.[this.indexIntegration]?.id;
  }

  openNewFlow(): void {
    this.modalService.open(NewFlowDialogComponent, { size: 'lg', ariaLabelledBy: 'new-flow-title' });
  }

  openImport(): void {
    this.modalService.open(ImportDialogComponent, { size: 'lg', ariaLabelledBy: 'import-flow-title' });
  }

  openFluxygenExport(): void {
    const integrationId = this.integrationId;
    if (integrationId !== undefined) {
      FluxygenExportDialogComponent.open(this.modalService, integrationId);
    }
  }

  trackId(index: number, item: IFlow) {
    return item.id;
  }

  registerChangeInFlows() {
    this.eventSubscriptions.add(this.eventManager.subscribe('flowListModification', () => this.reset()));
  }

  sort(): string[] {
    return sortParams(this.sortState);
  }

  registerChangeCreatedIntegration() {
    this.eventSubscriptions.add(
      this.eventManager.subscribe('integrationCreated', () => {
        this.integrationExists = false;
        this.getIntegrations();
      }),
    );
  }

  registerDeletedFlows() {
    this.eventSubscriptions.add(
      this.eventManager.subscribe('flowDeleted', () => {
        this.loadFlows();
      }),
    );
  }

  trigerAction(selectedAction: string) {
    this.eventManager.broadcast({ name: 'trigerAction', content: selectedAction });
  }

  private onSuccess(data, headers) {
    if (this.integrations.length === 1) {
      this.links = this.parseLinks.parse(headers.get('link'));
    }
    this.flows = new Array<IFlow>();
    for (let i = 0; i < data.length; i++) {
      this.flows.push(data[i]);
    }
    this.totalItems = headers.get('X-Total-Count');
    this.flowsLoading = false;
    if (!this.flows.length) {
      // A first-time user on an empty Gateway gets the Tutorials to start with.
      this.tutorialPanel.showOnFirstVisit();
    }
    this.changeDetector.detectChanges();
  }

  protected onError(errorMessage: string) {
    this.flowsLoading = false;
    this.flowsLoadFailed = true;
    this.changeDetector.detectChanges();
		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
  }
}
