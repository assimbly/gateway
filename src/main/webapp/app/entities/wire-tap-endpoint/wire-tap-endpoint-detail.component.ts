import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IWireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';

@Component({
    selector: 'jhi-wire-tap-endpoint-detail',
    templateUrl: './wire-tap-endpoint-detail.component.html'
})
export class WireTapEndpointDetailComponent implements OnInit {
    wireTapEndpoint: IWireTapEndpoint;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ wireTapEndpoint }) => {
            this.wireTapEndpoint = wireTapEndpoint;
        });
    }

    previousState() {
        window.history.back();
    }
}
