import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IErrorEndpoint } from 'app/shared/model/error-endpoint.model';

@Component({
    selector: 'jhi-error-endpoint-detail',
    templateUrl: './error-endpoint-detail.component.html'
})
export class ErrorEndpointDetailComponent implements OnInit {
    errorEndpoint: IErrorEndpoint;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ errorEndpoint }) => {
            this.errorEndpoint = errorEndpoint;
        });
    }

    previousState() {
        window.history.back();
    }
}
