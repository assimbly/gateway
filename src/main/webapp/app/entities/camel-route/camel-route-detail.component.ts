import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { CamelRoute } from './camel-route.model';
import { CamelRouteService } from './camel-route.service';

@Component({
    selector: 'jhi-camel-route-detail',
    templateUrl: './camel-route-detail.component.html'
})
export class CamelRouteDetailComponent implements OnInit, OnDestroy {

    camelRoute: CamelRoute;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private camelRouteService: CamelRouteService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInCamelRoutes();
    }

    load(id) {
        this.camelRouteService.find(id).subscribe((camelRoute) => {
            this.camelRoute = camelRoute;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInCamelRoutes() {
        this.eventSubscriber = this.eventManager.subscribe(
            'camelRouteListModification',
            (response) => this.load(this.camelRoute.id)
        );
    }
}
