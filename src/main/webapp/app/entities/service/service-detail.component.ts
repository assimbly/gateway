import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { Service } from './service.model';
import { ServiceService } from './service.service';
import { ServiceKeysService } from '../service-keys/service-keys.service';
import { ServiceKeys } from '../service-keys';

@Component({
    selector: 'jhi-service-detail',
    templateUrl: './service-detail.component.html'
})
export class ServiceDetailComponent implements OnInit, OnDestroy {

    service: Service;
    serviceKeys: Array<ServiceKeys>;
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
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInServices() {
        this.eventSubscriber = this.eventManager.subscribe(
            'serviceListModification',
            (response) => this.load(this.service.id)
        );
    }
}
