import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IGateway } from 'app/shared/model/gateway.model';
import { AccountService } from 'app/core';
import { GatewayService } from './gateway.service';
import { FlowService } from '../flow/flow.service';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'jhi-gateway',
    templateUrl: './gateway.component.html'
})
export class GatewayComponent implements OnInit, OnDestroy {
    gateways: IGateway[] = [];
    currentAccount: any;
    eventSubscriber: Subscription;


    constructor(
        protected flowService: FlowService,
        protected gatewayService: GatewayService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        private router: Router,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.gatewayService.query().subscribe(
            (res: HttpResponse<IGateway[]>) => {
                this.gateways = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInGateways();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IGateway) {
        return item.id;
    }

    registerChangeInGateways() {
        this.eventSubscriber = this.eventManager.subscribe('gatewayListModification', response => this.loadAll());
    }

    downloadConfiguration(gateway: IGateway) {
        this.flowService.exportGatewayConfiguration(gateway);
    }

    uploadConfiguration() {
        this.router.navigate(['/', { outlets: { popup: ['import'] } }]);
        this.eventManager.subscribe('gatewayListModification', res => this.reset());
    }

    restartGateway(index: number) {
        alert('Are you sure? This will restart Assimbly Gateway and all its flows.');

        this.gatewayService.stopGateway(index).subscribe(
           (res: HttpResponse<IGateway[]>) => {
                this.gateways = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
             );
            console.log('Gateway is gestopt');
            setTimeout(() => { this.startGateway()}, 1000)
    }

    startGateway() {
        this.gatewayService.startGateway(1).subscribe(
           (res: HttpResponse<IGateway[]>) => {
            },
            (res: HttpErrorResponse) => this.onError(res.message)
             );
            console.log('Gateway is gestart');
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    reset() {
        this.gateways = [];
        this.loadAll();
    }
}
