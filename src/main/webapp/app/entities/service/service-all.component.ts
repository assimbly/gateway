import { Component, OnInit } from '@angular/core';
import { JhiAlertService } from 'ng-jhipster';

import { Service } from './service.model';
import { ServiceService } from './service.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-service-all',
    templateUrl: './service-all.component.html'
})

export class ServiceAllComponent implements OnInit {
    public services: Array<Service> = [];
    public page: any;
    private currentAccount: any;

    constructor(
        private serviceService: ServiceService,
        private jhiAlertService: JhiAlertService,
        private principal: Principal
    ) {
    }

    ngOnInit() {
        this.loadAllServices();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
    }

    reset() {
        this.page = 0;
        this.services = [];
        this.loadAllServices();
    }

    private loadAllServices() {
        this.serviceService.query().subscribe(
            (res: ResponseWrapper) => {
                this.services = res.json;
                console.log(this.services);
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
