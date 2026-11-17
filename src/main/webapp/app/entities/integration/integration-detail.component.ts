import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IIntegration } from 'app/shared/model/integration.model';

@Component({
    selector: 'jhi-integration-detail',
    templateUrl: './integration-detail.component.html',
    imports: [RouterModule, FontAwesomeModule, AlertError],
})
export class IntegrationDetailComponent implements OnInit {
    protected activatedRoute = inject(ActivatedRoute);

    integration!: IIntegration;

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ integration }) => {
            this.integration = integration;
        });
    }

    previousState() {
        window.history.back();
    }
}
