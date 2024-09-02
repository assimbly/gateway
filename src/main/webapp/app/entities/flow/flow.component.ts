import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription, forkJoin } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { ParseLinks } from 'app/core/util/parse-links.service';
import { AlertService } from 'app/core/util/alert.service';

import { Router } from '@angular/router';

import { IFlow } from 'app/shared/model/flow.model';
import { AccountService } from 'app/core/auth/account.service';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { FlowService } from './flow.service';
import { IIntegration, GatewayType, EnvironmentType } from 'app/shared/model/integration.model';
import { IntegrationService } from 'app/entities/integration/integration.service';

@Component({
  selector: 'jhi-flow',
  templateUrl: './flow.component.html',
})
export class FlowComponent implements OnInit, OnDestroy {
  integrations: IIntegration[];
  integration: IIntegration;
  flows: IFlow[];
  flow: IFlow;
  currentAccount: any;
  eventSubscriber: Subscription;
  itemsPerPage: number;
  links: any;
  page: any;
  predicate: any;
  queryCount: any;
  reverse: any;
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

  constructor(
    protected flowService: FlowService,
    protected alertService: AlertService,
    protected eventManager: EventManager,
    protected parseLinks: ParseLinks,
    protected accountService: AccountService,
    protected integrationService: IntegrationService,
    protected router: Router
  ) {
    this.flows = [];
    this.itemsPerPage = ITEMS_PER_PAGE + 5;
    this.page = 0;
    this.links = {
      last: 0,
    };
    this.predicate = 'name';
    this.reverse = true;
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

  reset() {
    this.page = 0;
    this.flows = [];
    this.loadFlows();
  }

  loadPage(page) {
    this.page = 0; // page;
    this.itemsPerPage = this.itemsPerPage + 5;
    this.loadFlows();
  }

  ngOnInit() {
    this.getIntegrations();
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });
    this.finished = true;
    this.registerChangeInFlows();
    this.registerChangeCreatedIntegration();
    this.registerDeletedFlows();
  }

  ngAfterViewInit() {
    this.finished = true;
	// Uncomment when to sync local certifcates in keystore.jks with certificates in the database
    // this.certificateService.syncTrustore().subscribe(res => {});
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
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
      if (this.indexIntegration > 0) {
        this.integrationExists = true;
      } else {
        this.integrationExists = false;
        this.indexIntegration = 0;
      }
    }
  }

  trackId(index: number, item: IFlow) {
    return item.id;
  }

  registerChangeInFlows() {
    this.eventSubscriber = this.eventManager.subscribe('flowListModification', response => this.reset());
  }

  sort() {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'name') {
      result.push('name');
    }
    return result;
  }

  registerChangeCreatedIntegration() {
    this.eventSubscriber = this.eventManager.subscribe('integrationCreated', response => {
      this.integrationExists = false;
      this.getIntegrations();
    });
  }

  registerDeletedFlows() {
    this.eventManager.subscribe('flowDeleted', res => {
      this.loadFlows();
    });
  }

  trigerAction(selectedAction: string) {
    this.eventManager.broadcast({ name: 'trigerAction', content: selectedAction });
  }

  navigateToFlowEditor(mode: string, editorType: string): void {
	  this.router.navigate(['../flow/editor'], {queryParams: { mode: mode, editor: editorType }});
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
  }

  protected onError(errorMessage: string) {
		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
  }
}
