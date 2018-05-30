import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { FromEndpoint } from './from-endpoint.model';
import { FromEndpointService } from './from-endpoint.service';
import { HeaderService } from '../header/header.service';
import { ServiceService } from '../service/service.service';

@Component({
    selector: 'jhi-from-endpoint-detail',
    templateUrl: './from-endpoint-detail.component.html'
})
export class FromEndpointDetailComponent implements OnInit, OnDestroy {

    fromEndpoint: FromEndpoint;
    private subscription: Subscription;
    private eventSubscriber: Subscription;
    public headerName: string;
    public serviceName: string;

    constructor(
        private eventManager: JhiEventManager,
        private fromEndpointService: FromEndpointService,
        private headerService: HeaderService,
        private serviceService: ServiceService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInFromEndpoints();
    }

    load(id) {
        this.fromEndpointService.find(id).subscribe((fromEndpoint) => {
            this.fromEndpoint = fromEndpoint;

            this.headerService.find(this.fromEndpoint.headerId)
                .subscribe((header) => {
                    this.headerName = header.name;
                });

            this.serviceService.find(this.fromEndpoint.serviceId)
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

    registerChangeInFromEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe(
            'fromEndpointListModification',
            (response) => this.load(this.fromEndpoint.id)
        );
    }
}
