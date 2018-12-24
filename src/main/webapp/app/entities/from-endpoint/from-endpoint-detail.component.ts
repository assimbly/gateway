import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';
import { FromEndpointService } from './from-endpoint.service';
import { HeaderService } from '../header/header.service';
import { ServiceService } from '../service/service.service';
import { Subscription } from "rxjs";
import { JhiEventManager } from "ng-jhipster";

@Component({
    selector: 'jhi-from-endpoint-detail',
    templateUrl: './from-endpoint-detail.component.html'
})
export class FromEndpointDetailComponent implements OnInit {
    fromEndpoint: IFromEndpoint;

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
        this.route.data.subscribe(({ fromEndpoint }) => {
            this.fromEndpoint = fromEndpoint;

            this.headerService.find(this.fromEndpoint.headerId)
                .subscribe((header) => {
                    this.headerName = header.body.name;
                });

            this.serviceService.find(this.fromEndpoint.serviceId)
                .subscribe((service) => {
                    this.serviceName = service.body.name;
                });
        });
    }

    previousState() {
        window.history.back();
    }
}
