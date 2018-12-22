import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ServiceService } from './service.service';
import { ServiceKeysService } from '../service-keys/service-keys.service';
import { ServiceKeys } from '../service-keys';
import { Service } from 'app/shared/model/service.model';


@Component({
    selector: 'jhi-service-detail',
    templateUrl: './service-detail.component.html'
})
export class ServiceDetailComponent implements OnInit {

    public service: Service;
    public serviceKeys: Array<ServiceKeys>;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private serviceService: ServiceService,
        private serviceKeysService: ServiceKeysService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInServices();
    }

    private load(id) {
        this.serviceService.find(id).subscribe((service) => {
            this.service = service;
            this.loadServiceKeys(this.service.id);
        });
    }

    private loadServiceKeys(id: number) {
        this.serviceKeysService.query().subscribe((res) => {
            this.serviceKeys = res.json.filter((sk) => sk.serviceId === id);
        });

    previousState() {
        window.history.back();
    }
}
