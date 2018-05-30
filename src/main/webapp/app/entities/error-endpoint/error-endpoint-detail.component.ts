import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { ErrorEndpoint } from './error-endpoint.model';
import { ErrorEndpointService } from './error-endpoint.service';
import { HeaderService } from '../header/header.service';
import { ServiceService } from '../service/service.service';

@Component({
    selector: 'jhi-error-endpoint-detail',
    templateUrl: './error-endpoint-detail.component.html'
})
export class ErrorEndpointDetailComponent implements OnInit, OnDestroy {

    errorEndpoint: ErrorEndpoint;
    private subscription: Subscription;
    private eventSubscriber: Subscription;
    public headerName: string;
    public serviceName: string;

    constructor(
        private eventManager: JhiEventManager,
        private errorEndpointService: ErrorEndpointService,
        private headerService: HeaderService,
        private serviceService: ServiceService,
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

            this.headerService.find(this.errorEndpoint.headerId)
                .subscribe((header) => {
                    this.headerName = header.name;
                });

            this.serviceService.find(this.errorEndpoint.serviceId)
                .subscribe((service) => {
                    this.serviceName = service.name;
                });
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
