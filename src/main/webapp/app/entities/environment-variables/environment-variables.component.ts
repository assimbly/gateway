import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { EnvironmentVariables } from './environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-environment-variables',
    templateUrl: './environment-variables.component.html'
})
export class EnvironmentVariablesComponent implements OnInit, OnDestroy {
environmentVariables: EnvironmentVariables[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private environmentVariablesService: EnvironmentVariablesService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.environmentVariablesService.query().subscribe(
            (res: ResponseWrapper) => {
                this.environmentVariables = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInEnvironmentVariables();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: EnvironmentVariables) {
        return item.id;
    }
    registerChangeInEnvironmentVariables() {
        this.eventSubscriber = this.eventManager.subscribe('environmentVariablesListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
