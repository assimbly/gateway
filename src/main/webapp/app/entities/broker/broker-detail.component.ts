import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IBroker } from 'app/shared/model/broker.model';

@Component({
    standalone: false,
    selector: 'jhi-broker-detail',
    templateUrl: './broker-detail.component.html'
})
export class BrokerDetailComponent implements OnInit {
    broker: IBroker;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ broker }) => {
            this.broker = broker;
        });
    }

    previousState() {
        window.history.back();
    }
}
