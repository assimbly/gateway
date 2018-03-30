import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { ServiceKeys } from './service-keys.model';
import { ServiceKeysService } from './service-keys.service';

@Component({
    selector: 'jhi-service-keys-detail',
    templateUrl: './service-keys-detail.component.html'
})
export class ServiceKeysDetailComponent implements OnInit, OnDestroy {

    serviceKeys: ServiceKeys;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private serviceKeysService: ServiceKeysService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInServiceKeys();
    }

    load(id) {
        this.serviceKeysService.find(id).subscribe((serviceKeys) => {
            this.serviceKeys = serviceKeys;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInServiceKeys() {
        this.eventSubscriber = this.eventManager.subscribe(
            'serviceKeysListModification',
            (response) => this.load(this.serviceKeys.id)
        );
    }
}
