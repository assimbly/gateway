import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';

@Component({
    selector: 'jhi-environment-variables-detail',
    templateUrl: './environment-variables-detail.component.html'
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
