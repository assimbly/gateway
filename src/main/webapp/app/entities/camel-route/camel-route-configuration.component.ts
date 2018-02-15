import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';
import {NgbTabset} from '@ng-bootstrap/ng-bootstrap';

import { CamelRoute } from './camel-route.model';
import { CamelRouteService } from './camel-route.service';
import { FromEndpointComponent, FromEndpointService, FromEndpoint } from '../../entities/from-endpoint/';
import { ErrorEndpointComponent, ErrorEndpointService, ErrorEndpoint } from '../../entities/error-endpoint/';

@Component({
    selector: 'jhi-camel-route-configuration',
    templateUrl: './camel-route-configuration.component.html'
    ,
    entryComponents: [
        FromEndpointComponent,
        ErrorEndpointComponent
    ],
})

export class CamelRouteConfigurationComponent implements OnInit, OnDestroy {

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
