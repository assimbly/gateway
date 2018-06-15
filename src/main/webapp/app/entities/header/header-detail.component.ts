import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { Header } from './header.model';
import { HeaderService } from './header.service';

@Component({
    selector: 'jhi-header-detail',
    templateUrl: './header-detail.component.html'
})
export class HeaderDetailComponent implements OnInit, OnDestroy {

    header: Header;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private headerService: HeaderService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInHeaders();
    }

    load(id) {
        this.headerService.find(id).subscribe((header) => {
            this.header = header;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInHeaders() {
        this.eventSubscriber = this.eventManager.subscribe(
            'headerListModification',
            (response) => this.load(this.header.id)
        );
    }
}
