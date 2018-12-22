import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Maintenance } from './maintenance.model';
import { MaintenanceService } from './maintenance.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-maintenance',
    templateUrl: './maintenance.component.html'
})
export class MaintenanceComponent implements OnInit, OnDestroy {
maintenances: Maintenance[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private maintenanceService: MaintenanceService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.maintenanceService.query().subscribe(
            (res: ResponseWrapper) => {
                this.maintenances = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInMaintenances();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: Maintenance) {
        return item.id;
    }
    registerChangeInMaintenances() {
        this.eventSubscriber = this.eventManager.subscribe('maintenanceListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
