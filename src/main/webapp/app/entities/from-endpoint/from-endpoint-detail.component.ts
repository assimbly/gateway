import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';

@Component({
    selector: 'jhi-from-endpoint-detail',
    templateUrl: './from-endpoint-detail.component.html'
})
export class FromEndpointDetailComponent implements OnInit {
    fromEndpoint: IFromEndpoint;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ fromEndpoint }) => {
            this.fromEndpoint = fromEndpoint;
        });
    }

    previousState() {
        window.history.back();
    }
}
