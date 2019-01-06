import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IToEndpoint } from 'app/shared/model/to-endpoint.model';

@Component({
    selector: 'jhi-to-endpoint-detail',
    templateUrl: './to-endpoint-detail.component.html'
})
export class ToEndpointDetailComponent implements OnInit {
    toEndpoint: IToEndpoint;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ toEndpoint }) => {
            this.toEndpoint = toEndpoint;
        });
    }

    previousState() {
        window.history.back();
    }
}
