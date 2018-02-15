import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { Gateway } from './gateway.model';
import { GatewayService } from './gateway.service';

@Component({
    selector: 'jhi-gateway-detail',
    templateUrl: './gateway-detail.component.html'
})
export class GatewayDetailComponent implements OnInit, OnDestroy {

    gateway: Gateway;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private gatewayService: GatewayService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInGateways();
    }

    load(id) {
        this.gatewayService.find(id).subscribe((gateway) => {
            this.gateway = gateway;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInGateways() {
        this.eventSubscriber = this.eventManager.subscribe(
            'gatewayListModification',
            (response) => this.load(this.gateway.id)
        );
    }
}
