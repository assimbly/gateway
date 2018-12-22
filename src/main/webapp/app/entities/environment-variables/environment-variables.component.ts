import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { AccountService } from 'app/core';
import { EnvironmentVariablesService } from './environment-variables.service';

@Component({
    selector: 'jhi-environment-variables',
    templateUrl: './environment-variables.component.html'
})
export class EnvironmentVariablesComponent implements OnInit, OnDestroy {
    environmentVariables: IEnvironmentVariables[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected environmentVariablesService: EnvironmentVariablesService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.environmentVariablesService.query().subscribe(
            (res: HttpResponse<IEnvironmentVariables[]>) => {
                this.environmentVariables = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInEnvironmentVariables();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IEnvironmentVariables) {
        return item.id;
    }

    registerChangeInEnvironmentVariables() {
        this.eventSubscriber = this.eventManager.subscribe('environmentVariablesListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
