import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IService } from 'app/shared/model/service.model';
import { ServiceKeysService } from '../service-keys/service-keys.service';
import { ServiceKeys } from 'app/shared/model/service-keys.model';
import { Service } from 'app/shared/model/service.model';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ServiceService } from 'app/entities/service/service.service';

@Component({
    selector: 'jhi-service-detail',
    templateUrl: './service-detail.component.html'
})
export class ServiceDetailComponent implements OnInit {
    service: IService;
    public serviceKeys: Array<ServiceKeys>;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        protected eventManager: EventManager,
        protected serviceService: ServiceService,
        protected serviceKeysService: ServiceKeysService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ service }) => {
            this.service = service;
        });
    }

    previousState() {
        window.history.back();
    }

    private load(id) {
        this.serviceService.find(id).subscribe(service => {
            this.service = service.body;
            this.loadServiceKeys(this.service.id);
        });
    }

    private loadServiceKeys(id: number) {
        this.serviceKeysService.query().subscribe(res => {
            this.serviceKeys = res.body.filter(sk => sk.serviceId === id);
        });
    }

    registerChangeInServices() {
        this.eventSubscriber = this.eventManager.subscribe('serviceListModification', response => this.load(this.service.id));
    }
}
