import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ErrorEndpoint } from './error-endpoint.model';
import { ErrorEndpointService } from './error-endpoint.service';
import { HeaderService } from '../header/header.service';
import { ServiceService } from '../service/service.service';
import { IErrorEndpoint } from 'app/shared/model/error-endpoint.model';

@Component({
    selector: 'jhi-error-endpoint-detail',
    templateUrl: './error-endpoint-detail.component.html'
})
export class ErrorEndpointDetailComponent implements OnInit {
    errorEndpoint: IErrorEndpoint;
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
        this.activatedRoute.data.subscribe(({ errorEndpoint }) => {
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
}
