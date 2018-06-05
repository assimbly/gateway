import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { HeaderKeys } from './header-keys.model';
import { HeaderKeysPopupService } from './header-keys-popup.service';
import { HeaderKeysService } from './header-keys.service';

@Component({
    selector: 'jhi-header-keys-delete-dialog',
    templateUrl: './header-keys-delete-dialog.component.html'
})
export class HeaderKeysDeleteDialogComponent {

    headerKeys: HeaderKeys;
    constructor(
        private headerKeysService: HeaderKeysService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.headerKeysService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({ name: 'headerKeyDeleted', content: id });
            this.eventManager.broadcast({
                name: 'headerKeysListModification',
                content: 'Deleted an headerKeys'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-header-keys-delete-popup',
    template: ''
})
export class HeaderKeysDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private headerKeysPopupService: HeaderKeysPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.headerKeysPopupService
                .open(HeaderKeysDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
