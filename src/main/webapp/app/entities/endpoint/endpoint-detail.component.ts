import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IEndpoint } from 'app/shared/model/endpoint.model';

@Component({
    selector: 'jhi-endpoint-detail',
    templateUrl: './endpoint-detail.component.html'
})
export class EndpointDetailComponent implements OnInit {
    endpoint: IEndpoint;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ endpoint }) => {
            this.endpoint = endpoint;
        });
    }

    previousState() {
        window.history.back();
    }
}
