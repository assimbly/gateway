import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';

@Component({
    selector: 'jhi-environment-variables-detail',
    templateUrl: './environment-variables-detail.component.html',
    imports: [CommonModule, RouterModule, FontAwesomeModule, AlertError],
})
export class EnvironmentVariablesDetailComponent implements OnInit {
    environmentVariables: IEnvironmentVariables;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ environmentVariables }) => {
            this.environmentVariables = environmentVariables;
        });
    }

    previousState() {
        window.history.back();
    }
}
