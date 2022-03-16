import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { IRoute } from 'app/shared/model/route.model';
import { RouteService } from './route.service';

@Component({
    templateUrl: './route-delete-dialog.component.html'
})
export class RouteDeleteDialogComponent {
    route?: IRoute;

    constructor(protected routeService: RouteService, public activeModal: NgbActiveModal, protected eventManager: EventManager) {}

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmDelete(id: number): void {
        this.routeService.delete(id).subscribe(() => {
			this.eventManager.broadcast(new EventWithContent('routeListModification', 'Deleted'));			
            this.activeModal.close();
        });
    }
}