import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IConnection } from 'app/shared/model/connection.model';
import { ConnectionKeysService } from '../connection-keys/connection-keys.service';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';
import { Connection } from 'app/shared/model/connection.model';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ConnectionService } from 'app/entities/connection/connection.service';

@Component({
    standalone: false,
    selector: 'jhi-connection-detail',
    templateUrl: './connection-detail.component.html'
})
export class ConnectionDetailComponent implements OnInit {
    connection: IConnection;
    public connectionKeys: Array<ConnectionKeys>;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        protected eventManager: EventManager,
        protected connectionService: ConnectionService,
        protected connectionKeysService: ConnectionKeysService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ connection }) => {
            this.connection = connection;
        });
    }

    previousState() {
        window.history.back();
    }

    private load(id) {
        this.connectionService.find(id).subscribe(connection => {
            this.connection = connection.body;
            this.loadConnectionKeys(this.connection.id);
        });
    }

    private loadConnectionKeys(id: number) {
        this.connectionKeysService.query().subscribe(res => {
            this.connectionKeys = res.body.filter(sk => sk.connectionId === id);
        });
    }

    registerChangeInServices() {
        this.eventSubscriber = this.eventManager.subscribe('connectionListModification', response => this.load(this.connection.id));
    }
}
