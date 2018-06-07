import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ServiceKeys } from './service-keys.model';
import { ServiceKeysPopupService } from './service-keys-popup.service';
import { ServiceKeysService } from './service-keys.service';

@Component({
    selector: 'jhi-service-keys-delete-dialog',
    templateUrl: './service-keys-delete-dialog.component.html'
})
export class ServiceKeysDeleteDialogComponent {

    serviceKeys: ServiceKeys;

    constructor(
        private serviceKeysService: ServiceKeysService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.serviceKeysService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({ name: 'serviceKeyDeleted', content: id });
            this.eventManager.broadcast({
                name: 'serviceKeysListModification',
                content: 'Deleted an serviceKeys'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-service-keys-delete-popup',
    template: ''
})
export class ServiceKeysDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private serviceKeysPopupService: ServiceKeysPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.serviceKeysPopupService
                .open(ServiceKeysDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
