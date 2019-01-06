import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IGateway } from 'app/shared/model/gateway.model';

@Component({
    selector: 'jhi-gateway-detail',
    templateUrl: './gateway-detail.component.html'
})
export class GatewayDetailComponent implements OnInit {
    gateway: IGateway;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ gateway }) => {
            this.gateway = gateway;
        });
    }

    previousState() {
        window.history.back();
    }
}
