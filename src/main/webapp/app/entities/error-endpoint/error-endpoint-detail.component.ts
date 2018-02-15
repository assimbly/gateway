import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { ErrorEndpoint } from './error-endpoint.model';
import { ErrorEndpointService } from './error-endpoint.service';

@Component({
    selector: 'jhi-error-endpoint-detail',
    templateUrl: './error-endpoint-detail.component.html'
})
export class ErrorEndpointDetailComponent implements OnInit, OnDestroy {

    errorEndpoint: ErrorEndpoint;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private errorEndpointService: ErrorEndpointService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInErrorEndpoints();
    }

    load(id) {
        this.errorEndpointService.find(id).subscribe((errorEndpoint) => {
            this.errorEndpoint = errorEndpoint;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInErrorEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe(
            'errorEndpointListModification',
            (response) => this.load(this.errorEndpoint.id)
        );
    }
}
