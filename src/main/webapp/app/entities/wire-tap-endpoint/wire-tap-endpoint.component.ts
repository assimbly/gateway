import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IWireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';
import { AccountService } from 'app/core';
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
    public isAdmin: boolean;

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
            (res: HttpResponse<IWireTapEndpoint[]>) => {
                this.wireTapEndpoints = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
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
        this.eventSubscriber = this.eventManager.subscribe('wireTapEndpointListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
