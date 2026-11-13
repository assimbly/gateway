import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IBroker } from 'app/shared/model/broker.model';

@Component({
    selector: 'jhi-broker-detail',
    templateUrl: './broker-detail.component.html',
    imports: [RouterModule, FontAwesomeModule, AlertError],
})
export class BrokerDetailComponent implements OnInit {
    protected activatedRoute = inject(ActivatedRoute);

    broker!: IBroker;

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ broker }) => {
            this.broker = broker;
        });
    }

    previousState() {
        window.history.back();
    }
}
