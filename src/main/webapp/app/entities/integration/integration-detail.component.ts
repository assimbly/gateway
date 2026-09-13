import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IIntegration } from 'app/shared/model/integration.model';

@Component({
    selector: 'jhi-integration-detail',
    templateUrl: './integration-detail.component.html',
    imports: [CommonModule, RouterModule, FontAwesomeModule, AlertError],
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
