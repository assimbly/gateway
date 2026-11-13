import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IConnectionKeys } from 'app/shared/model/connection-keys.model';

@Component({
    selector: 'jhi-connection-keys-detail',
    templateUrl: './connection-keys-detail.component.html',
    imports: [RouterModule, FontAwesomeModule, AlertError],
})
export class ConnectionKeysDetailComponent implements OnInit {
    protected activatedRoute = inject(ActivatedRoute);

    connectionKeys: IConnectionKeys;

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ connectionKeys }) => {
            this.connectionKeys = connectionKeys;
        });
    }

    previousState() {
        window.history.back();
    }
}
