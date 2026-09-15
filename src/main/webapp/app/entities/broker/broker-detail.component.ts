import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IBroker } from 'app/shared/model/broker.model';

@Component({
    selector: 'jhi-broker-detail',
    templateUrl: './broker-detail.component.html',
    imports: [CommonModule, RouterModule, FontAwesomeModule, AlertError],
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
