import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IRoute } from 'app/shared/model/route.model';
import { RouteService } from './route.service';

@Component({
    templateUrl: './route-delete-dialog.component.html'
})
export class RouteDeleteDialogComponent {
    route?: IRoute;

    constructor(protected routeService: RouteService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmDelete(id: number): void {
        this.routeService.delete(id).subscribe(() => {
            this.eventManager.broadcast('routeListModification');
            this.activeModal.close();
        });
    }
}
