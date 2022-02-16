import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { AccountService } from 'app/core/auth/account.service';
import { EnvironmentVariablesService } from './environment-variables.service';

@Component({
    selector: 'jhi-environment-variables',
    templateUrl: './environment-variables.component.html'
})
export class EnvironmentVariablesComponent implements OnInit, OnDestroy {
    environmentVariables: IEnvironmentVariables[];
    currentAccount: any;
    eventSubscriber: Subscription;

    // sorting
    predicate: any;
    reverse: any;
    page: any;
    last: any = 100;

    constructor(
        protected environmentVariablesService: EnvironmentVariablesService,
        protected alertService: AlertService,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {
        this.page = 0;
        this.predicate = 'key';
        this.reverse = true;
    }

    loadAll() {
        this.environmentVariablesService
            .query({
                page: this.page,
                sort: this.sort()
            })
            .subscribe(
                (res: HttpResponse<IEnvironmentVariables[]>) => {
                    if (this.environmentVariables) {
                        this.environmentVariables.push(...res.body);
                    } else {
                        this.environmentVariables = res.body;
                    }

                    if (res.body.length < 20) {
                        this.last = this.page;
                    }
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    loadPage(page: number) {
        this.page = page;
        this.loadAll();
    }

    ngOnInit() {
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.loadAll();
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
		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'key') {
            result.push('key');
        }
        return result;
    }

    reset() {
        this.page = 0;
        this.environmentVariables = [];
        this.loadAll();
    }
}
