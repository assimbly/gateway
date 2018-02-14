import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { HeaderKeys } from './header-keys.model';
import { HeaderKeysService } from './header-keys.service';

@Component({
    selector: 'jhi-header-keys-detail',
    templateUrl: './header-keys-detail.component.html'
})
export class HeaderKeysDetailComponent implements OnInit, OnDestroy {

    headerKeys: HeaderKeys;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private headerKeysService: HeaderKeysService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInHeaderKeys();
    }

    load(id) {
        this.headerKeysService.find(id).subscribe((headerKeys) => {
            this.headerKeys = headerKeys;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInHeaderKeys() {
        this.eventSubscriber = this.eventManager.subscribe(
            'headerKeysListModification',
            (response) => this.load(this.headerKeys.id)
        );
    }
}
