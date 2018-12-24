import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IToEndpoint } from 'app/shared/model/to-endpoint.model';
import { ToEndpointService } from './to-endpoint.service';
import { HeaderService } from '../header/header.service';
import { ServiceService } from '../service/service.service';
import { Subscription } from "rxjs";
import { JhiEventManager } from "ng-jhipster";

@Component({
    selector: 'jhi-to-endpoint-detail',
    templateUrl: './to-endpoint-detail.component.html'
})
export class ToEndpointDetailComponent implements OnInit {

    toEndpoint: IToEndpoint;
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
        this.route.data.subscribe(({ toEndpoint }) => {
            this.toEndpoint = toEndpoint;

            this.headerService.find(this.toEndpoint.headerId)
                .subscribe((header) => {
                    this.headerName = header.body.name;
                });

            this.serviceService.find(this.toEndpoint.serviceId)
                .subscribe((service) => {
                    this.serviceName = service.body.name;
                });
        });
    }

    previousState() {
        window.history.back();
    }
}
