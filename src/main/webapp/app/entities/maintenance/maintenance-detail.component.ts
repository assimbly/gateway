import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IMaintenance } from 'app/shared/model/maintenance.model';

@Component({
    selector: 'jhi-maintenance-detail',
    templateUrl: './maintenance-detail.component.html'
})
export class MaintenanceDetailComponent implements OnInit {
    maintenance: IMaintenance;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ maintenance }) => {
            this.maintenance = maintenance;
        });
    }

    previousState() {
        window.history.back();
    }
}
