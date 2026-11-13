import { Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AlertError } from 'app/shared/alert';

import { IConnection } from 'app/shared/model/connection.model';
import { ConnectionKeysService } from '../connection-keys/connection-keys.service';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';
import { Connection } from 'app/shared/model/connection.model';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ConnectionService } from 'app/entities/connection/connection.service';

@Component({
    selector: 'jhi-connection-detail',
    templateUrl: './connection-detail.component.html',
    imports: [RouterModule, AlertError, NgClass],
})
export class ConnectionDetailComponent implements OnInit {
    protected eventManager = inject(EventManager);
    protected connectionService = inject(ConnectionService);
    protected connectionKeysService = inject(ConnectionKeysService);
    protected activatedRoute = inject(ActivatedRoute);

    connection!: IConnection;
    public connectionKeys!: Array<ConnectionKeys>;
    private subscription!: Subscription;
    private eventSubscriber!: Subscription;

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ connection }) => {
            this.connection = connection;
        });
    }

    previousState() {
        window.history.back();
    }

    private load(id: number) {
        this.connectionService.find(id).subscribe(connection => {
            this.connection = connection.body!;
            this.loadConnectionKeys(this.connection.id!);
        });
    }

    private loadConnectionKeys(id: number) {
        this.connectionKeysService.query().subscribe(res => {
            this.connectionKeys = res.body!.filter(sk => sk.connectionId === id);
        });
    }

    registerChangeInServices() {
        this.eventSubscriber = this.eventManager.subscribe('connectionListModification', response => this.load(this.connection.id!));
    }
}
