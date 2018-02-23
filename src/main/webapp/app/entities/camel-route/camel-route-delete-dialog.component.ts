import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { CamelRoute } from './camel-route.model';
import { CamelRoutePopupService } from './camel-route-popup.service';
import { CamelRouteService } from './camel-route.service';

@Component({
    selector: 'jhi-camel-route-delete-dialog',
    templateUrl: './camel-route-delete-dialog.component.html'
})
export class CamelRouteDeleteDialogComponent {

    camelRoute: CamelRoute;

    constructor(
        private camelRouteService: CamelRouteService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.camelRouteService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'camelRouteListModification',
                content: 'Deleted an camelRoute'
            });
            this.activeModal.dismiss(true);
        });
    }

    confirmDeleteAll(id: number) {
        this.camelRouteService.deleteAll(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'camelRouteListModification',
                content: 'Deleted an camelRoute'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-camel-route-delete-popup',
    template: ''
})
export class CamelRouteDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private camelRoutePopupService: CamelRoutePopupService
    ) { }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.camelRoutePopupService
                .open(CamelRouteDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
