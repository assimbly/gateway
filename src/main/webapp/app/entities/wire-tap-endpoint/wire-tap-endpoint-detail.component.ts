import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { WireTapEndpoint } from './wire-tap-endpoint.model';
import { WireTapEndpointService } from './wire-tap-endpoint.service';

@Component({
    selector: 'jhi-wire-tap-endpoint-detail',
    templateUrl: './wire-tap-endpoint-detail.component.html'
})
export class WireTapEndpointDetailComponent implements OnInit, OnDestroy {

    wireTapEndpoint: WireTapEndpoint;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private wireTapEndpointService: WireTapEndpointService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInWireTapEndpoints();
    }

    load(id) {
        this.wireTapEndpointService.find(id).subscribe((wireTapEndpoint) => {
            this.wireTapEndpoint = wireTapEndpoint;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInWireTapEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe(
            'wireTapEndpointListModification',
            (response) => this.load(this.wireTapEndpoint.id)
        );
    }
}
