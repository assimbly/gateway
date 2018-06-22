import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { Response } from '@angular/http';

import { Gateway } from './gateway.model';
import { GatewayService } from './gateway.service';
import { Principal, ResponseWrapper } from '../../shared';
import { FlowService } from '../flow/flow.service';

@Component({
    selector: 'jhi-gateway',
    templateUrl: './gateway.component.html'
})
export class GatewayComponent implements OnInit, OnDestroy {

    gateways: Gateway[] = new Array<Gateway>();
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private flowService: FlowService,
        private gatewayService: GatewayService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.gatewayService.query().subscribe(
            (res: ResponseWrapper) => {
                this.gateways = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInGateways();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: Gateway) {
        return item.id;
    }

    registerChangeInGateways() {
        this.eventSubscriber = this.eventManager.subscribe('gatewayListModification', (response) => this.loadAll());
    }

    downloadConfiguration(gateway: Gateway) {
        this.flowService.exportGatewayConfiguration(gateway);
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
