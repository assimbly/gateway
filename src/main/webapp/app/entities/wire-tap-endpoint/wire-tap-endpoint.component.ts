import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { WireTapEndpoint } from './wire-tap-endpoint.model';
import { WireTapEndpointService } from './wire-tap-endpoint.service';
import { Principal, ResponseWrapper } from '../../shared';
import { Router } from '@angular/router';

@Component({
    selector: 'jhi-wire-tap-endpoint',
    templateUrl: './wire-tap-endpoint.component.html'
})
export class WireTapEndpointComponent implements OnInit, OnDestroy {
    wireTapEndpoints: Array<WireTapEndpoint> = [];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private wireTapEndpointService: WireTapEndpointService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal,
        private router: Router
    ) {
    }

    loadAll() {
        this.wireTapEndpointService.query().subscribe(
            (res: ResponseWrapper) => {
                this.wireTapEndpoints = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInWireTapEndpoints();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    delete(id) {
        this.wireTapEndpointService.delete(id).subscribe((r) => {
            this.wireTapEndpoints.splice(this.wireTapEndpoints.indexOf(this.wireTapEndpoints.find((w) => w.id === id)), 1)
        });
    }

    navigateToCreate() {
        this.router.navigate(['/wire-tap-endpoint-create']);
    }

    trackId(index: number, item: WireTapEndpoint) {
        return item.id;
    }
    registerChangeInWireTapEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe('wireTapEndpointListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
