import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ToEndpoint } from './to-endpoint.model';
import { ToEndpointService } from './to-endpoint.service';
import { HeaderService } from '../header/header.service';
import { ServiceService } from '../service/service.service';

@Component({
    selector: 'jhi-to-endpoint-detail',
    templateUrl: './to-endpoint-detail.component.html'
})
export class ToEndpointDetailComponent implements OnInit {

    toEndpoint: ToEndpoint;
    private subscription: Subscription;
    private eventSubscriber: Subscription;
    public headerName: string;
    public serviceName: string;

    constructor(
        private eventManager: JhiEventManager,
        private toEndpointService: ToEndpointService,
        private headerService: HeaderService,
        private serviceService: ServiceService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ toEndpoint }) => {
            this.toEndpoint = toEndpoint;

            this.headerService.find(this.toEndpoint.headerId)
                .subscribe((header) => {
                    this.headerName = header.name;
                });

            this.serviceService.find(this.toEndpoint.serviceId)
                .subscribe((service) => {
                    this.serviceName = service.name;
                });
        });
    }

    previousState() {
        window.history.back();
    }
}
