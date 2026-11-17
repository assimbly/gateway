import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { IRoute } from 'app/shared/model/route.model';
import { RouteService } from './route.service';

@Component({
  templateUrl: './route-delete-dialog.component.html',
  imports: [FontAwesomeModule, AlertError],
})
export class RouteDeleteDialogComponent {
    protected routeService = inject(RouteService);
    activeModal = inject(NgbActiveModal);
    protected eventManager = inject(EventManager);

    route?: IRoute;

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
