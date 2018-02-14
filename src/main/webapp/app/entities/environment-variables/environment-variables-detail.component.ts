import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { EnvironmentVariables } from './environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';

@Component({
    selector: 'jhi-environment-variables-detail',
    templateUrl: './environment-variables-detail.component.html'
})
export class EnvironmentVariablesDetailComponent implements OnInit, OnDestroy {

    environmentVariables: EnvironmentVariables;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private environmentVariablesService: EnvironmentVariablesService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInEnvironmentVariables();
    }

    load(id) {
        this.environmentVariablesService.find(id).subscribe((environmentVariables) => {
            this.environmentVariables = environmentVariables;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInEnvironmentVariables() {
        this.eventSubscriber = this.eventManager.subscribe(
            'environmentVariablesListModification',
            (response) => this.load(this.environmentVariables.id)
        );
    }
}
