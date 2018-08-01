import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Header } from './header.model';
import { HeaderPopupService } from './header-popup.service';
import { HeaderService } from './header.service';

@Component({
    selector: 'jhi-header-delete-dialog',
    templateUrl: './header-delete-dialog.component.html'
})
export class HeaderDeleteDialogComponent {

    header: Header;
    message = 'Are you sure you want to delete this Header?';
    disableDelete: boolean;

    constructor(
        private headerService: HeaderService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager,
        private router: Router
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.headerService.delete(id).subscribe(() => {
            this.eventManager.broadcast({
                name: 'headerListModification',
                content: 'Deleted an header'
            });
            this.router.navigate(['/header']);
            setTimeout(() => {
                this.activeModal.close();
            }, 0);
        }, () => {
            this.message = 'Header ' + this.header.name + ' can not be deleted (header is used by a flow)';
            this.disableDelete = true;
        });
    }
}

@Component({
    selector: 'jhi-header-delete-popup',
    template: ''
})
export class HeaderDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private headerPopupService: HeaderPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.headerPopupService
                .open(HeaderDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
