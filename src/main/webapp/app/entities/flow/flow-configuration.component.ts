import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';

import { IFlow, Flow } from 'app/shared/model/flow.model';
import { IFromEndpoint, FromEndpoint } from 'app/shared/model/from-endpoint.model';
import { IErrorEndpoint, ErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { FromEndpointComponent, FromEndpointService } from '../../entities/from-endpoint/';
import { ErrorEndpointComponent, ErrorEndpointService } from '../../entities/error-endpoint/';
import { FlowService } from 'app/entities/flow';

@Component({
    selector: 'jhi-flow-configuration',
    templateUrl: './flow-configuration.component.html',
    entryComponents: [FromEndpointComponent, ErrorEndpointComponent]
})
export class FlowConfigurationComponent implements OnInit, OnDestroy {
    flow: Flow;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(private eventManager: JhiEventManager, private flowService: FlowService, private route: ActivatedRoute) {}

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            this.load(params['id']);
        });
        this.registerChangeInFlows();
    }

    load(id) {
        this.flowService.find(id).subscribe(flow => {
            this.flow = flow.body;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInFlows() {
        this.eventSubscriber = this.eventManager.subscribe('flowListModification', response => this.load(this.flow.id));
    }
}
