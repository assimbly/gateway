import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';

@Component({
    selector: 'jhi-environment-variables-detail',
    templateUrl: './environment-variables-detail.component.html',
    imports: [RouterModule, FontAwesomeModule, AlertError],
})
export class EnvironmentVariablesDetailComponent implements OnInit {
    protected activatedRoute = inject(ActivatedRoute);

    environmentVariables!: IEnvironmentVariables;

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ environmentVariables }) => {
            this.environmentVariables = environmentVariables;
        });
    }

    previousState() {
        window.history.back();
    }
}
