import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { ErrorEndpointService } from './error-endpoint.service';
import { HeaderService } from '../header/header.service';
import { ServiceService } from '../service/service.service';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

@Component({
    selector: 'jhi-error-endpoint-detail',
    templateUrl: './error-endpoint-detail.component.html'
})
export class ErrorEndpointDetailComponent implements OnInit {

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
        this.route.data.subscribe(({ errorEndpoint }) => {
            this.errorEndpoint = errorEndpoint;

            this.headerService.find(this.errorEndpoint.headerId)
                .subscribe(header => {
                    this.headerName = header.body.name;
                });

            this.serviceService.find(this.errorEndpoint.serviceId)
                .subscribe(service => {
                    this.serviceName = service.body.name;
                });
        });
    }

    previousState() {
        window.history.back();
    }
}
