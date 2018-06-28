import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { Maintenance } from './maintenance.model';
import { MaintenanceService } from './maintenance.service';

@Component({
    selector: 'jhi-maintenance-detail',
    templateUrl: './maintenance-detail.component.html'
})
export class MaintenanceDetailComponent implements OnInit, OnDestroy {

    maintenance: Maintenance;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private maintenanceService: MaintenanceService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInMaintenances();
    }

    load(id) {
        this.maintenanceService.find(id).subscribe((maintenance) => {
            this.maintenance = maintenance;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInMaintenances() {
        this.eventSubscriber = this.eventManager.subscribe(
            'maintenanceListModification',
            (response) => this.load(this.maintenance.id)
        );
    }
}
