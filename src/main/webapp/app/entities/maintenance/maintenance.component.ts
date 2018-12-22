import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IMaintenance } from 'app/shared/model/maintenance.model';
import { AccountService } from 'app/core';
import { MaintenanceService } from './maintenance.service';

@Component({
    selector: 'jhi-maintenance',
    templateUrl: './maintenance.component.html'
})
export class MaintenanceComponent implements OnInit, OnDestroy {
    maintenances: IMaintenance[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected maintenanceService: MaintenanceService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.maintenanceService.query().subscribe(
            (res: HttpResponse<IMaintenance[]>) => {
                this.maintenances = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInMaintenances();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IMaintenance) {
        return item.id;
    }

    registerChangeInMaintenances() {
        this.eventSubscriber = this.eventManager.subscribe('maintenanceListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
