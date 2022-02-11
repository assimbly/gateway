import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription, forkJoin } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { Router } from '@angular/router';

import { IFlow } from 'app/shared/model/flow.model';
import { AccountService } from 'app/core/auth/account.service';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { FlowService } from './flow.service';
import { IGateway, GatewayType, EnvironmentType } from 'app/shared/model/gateway.model';
import { GatewayService } from 'app/entities/gateway/gateway.service';
import { SecurityService } from 'app/entities/security/security.service';

@Component({
  selector: 'jhi-flow',
  templateUrl: './flow.component.html',
})
export class FlowComponent implements OnInit, OnDestroy {
  gateways: IGateway[];
  gateway: IGateway;
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
  gatewayExists: boolean;
  multipleGateways = false;
  finished = false;

  singleGatewayName: string;
  singleGatewayId: number;
  singleGatewayStage: string;

  configuredGateway: IGateway;
  indexGateway: number;

  flowActions = ['start', 'stop', 'pause', 'restart', 'resume'];
  selectedAction: string;
  test: any;
  searchText = '';

  constructor(
    protected flowService: FlowService,
    protected jhiAlertService: JhiAlertService,
    protected eventManager: JhiEventManager,
    protected parseLinks: JhiParseLinks,
    protected accountService: AccountService,
    protected gatewayService: GatewayService,
    protected securityService: SecurityService,
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
    if (this.gateways.length > 1) {
      this.getFlowsForSelectedGateway(this.gateways[this.indexGateway].id);
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

  getFlowsForSelectedGateway(event) {
    let id = (event.target as HTMLSelectElement).value as string;
    this.flowService
      .getFlowByGatewayId(Number(id), {
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
    this.getGateways();
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });
    this.finished = true;
    this.registerChangeInFlows();
    this.registerChangeCreatedGateway();
    this.registerDeletedFlows();
  }

  ngAfterViewInit() {
    this.finished = true;
    // this.securityService.syncTrustore().subscribe(res => {});
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  getGateways(): void {
    forkJoin(this.flowService.getGatewayName(), this.gatewayService.query()).subscribe(([gatewayName, gateways]) => {
      this.gateways = gateways.body;
      this.checkGatewayType(this.gateways, gatewayName.body);

      if (!this.gatewayExists) {
        console.log('Creating gateway');
        this.gateway = new Object();
        this.gateway.name = gatewayName.body;
        this.gateway.type = GatewayType.FULL;
        this.gateway.environmentName = 'Dev1';
        this.gateway.stage = EnvironmentType.DEVELOPMENT;
        this.gateway.defaultFromComponentType = 'file';
        this.gateway.defaultToComponentType = 'file';
        this.gateway.defaultErrorComponentType = 'file';

        this.gatewayService.create(this.gateway).subscribe(gateway => {
          console.log('gateway created');
          this.gateway = gateway.body;
          this.gateways.push(this.gateway);
          this.gatewayExists = true;
          this.singleGatewayName = gateway.body.name;
          this.singleGatewayId = gateway.body.id;
          this.singleGatewayStage = gateway.body.stage ? gateway.body.stage.toString().toLowerCase() : '';
        });
      } else {
        this.loadFlows();
        if (!this.multipleGateways) {
          this.singleGatewayName = this.gateways[this.indexGateway].name;
          this.singleGatewayId = this.gateways[this.indexGateway].id;
          this.singleGatewayStage = this.gateways[this.indexGateway].stage
            ? this.gateways[this.indexGateway].stage.toString().toLowerCase()
            : '';
        }
      }
    });
  }

  checkGatewayType(gateways: IGateway[], gatewayName: String): void {
    if (gatewayName === 'default') {
      this.gatewayExists = gateways.length > 0;
      this.indexGateway = 0;
      this.multipleGateways = gateways.length > 1;
    } else {
      this.multipleGateways = false;
      this.configuredGateway = gateways.find(gateway => gateway.name === gatewayName);
      this.indexGateway = gateways.findIndex(gateway => gateway.name == gatewayName);
      if (this.indexGateway > 0) {
        this.gatewayExists = true;
      } else {
        this.gatewayExists = false;
        this.indexGateway = 0;
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

  registerChangeCreatedGateway() {
    this.eventSubscriber = this.eventManager.subscribe('gatewayCreated', response => {
      this.gatewayExists = false;
      this.getGateways();
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

  navigateToFlow() {
    this.router.navigate(['../../flow/edit-all']);
  }

  private onSuccess(data, headers) {
    if (this.gateways.length === 1) {
      this.links = this.parseLinks.parse(headers.get('link'));
    }
    this.flows = new Array<IFlow>();
    for (let i = 0; i < data.length; i++) {
      this.flows.push(data[i]);
    }
    this.totalItems = headers.get('X-Total-Count');
  }

  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }
}
