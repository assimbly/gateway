import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IIntegration } from 'app/shared/model/integration.model';

@Component({
    selector: 'jhi-integration-detail',
    templateUrl: './integration-detail.component.html'
})
export class IntegrationDetailComponent implements OnInit {
    integration: IIntegration;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ integration }) => {
            this.integration = integration;
        });
    }

    previousState() {
        window.history.back();
    }
}
