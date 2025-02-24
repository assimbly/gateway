import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IConnectionKeys } from 'app/shared/model/connection-keys.model';

@Component({
    standalone: false,
    selector: 'jhi-connection-keys-detail',
    templateUrl: './connection-keys-detail.component.html'
})
export class ConnectionKeysDetailComponent implements OnInit {
    connectionKeys: IConnectionKeys;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ connectionKeys }) => {
            this.connectionKeys = connectionKeys;
        });
    }

    previousState() {
        window.history.back();
    }
}
