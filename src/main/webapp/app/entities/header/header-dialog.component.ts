import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Header } from './header.model';
import { HeaderPopupService } from './header-popup.service';
import { HeaderService } from './header.service';

@Component({
    selector: 'jhi-header-dialog',
    templateUrl: './header-dialog.component.html'
})
export class HeaderDialogComponent implements OnInit {

    header: Header;
    isSaving: boolean;

    constructor(
        public activeModal: NgbActiveModal,
        private headerService: HeaderService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.header.id !== undefined) {
            this.subscribeToSaveResponse(
                this.headerService.update(this.header));
        } else {
            this.subscribeToSaveResponse(
                this.headerService.create(this.header));
        }
    }

    private subscribeToSaveResponse(result: Observable<Header>) {
        result.subscribe((res: Header) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: Header) {
        this.eventManager.broadcast({ name: 'headerListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }
}

@Component({
    selector: 'jhi-header-popup',
    template: ''
})
export class HeaderPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private headerPopupService: HeaderPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.headerPopupService
                    .open(HeaderDialogComponent as Component, params['id']);
            } else {
                this.headerPopupService
                    .open(HeaderDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
