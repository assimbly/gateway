import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Header } from './header.model';
import { HeaderKeys } from '../header-keys/header-keys.model';
import { HeaderPopupService } from './header-popup.service';
import { HeaderService } from './header.service';
import { ResponseWrapper } from '../../shared';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { HeaderKeysService } from '../header-keys';

@Component({
    selector: 'jhi-header-dialog',
    templateUrl: './header-dialog.component.html'
})
export class HeaderDialogComponent implements OnInit {

    header: Header;
    headers: Header[];
    headerKeys: HeaderKeys;
    isSaving: boolean;
    showEditButton = false;

    constructor(
        public activeModal: NgbActiveModal,
        private headerService: HeaderService,
        private headerKeysService: HeaderKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private route: ActivatedRoute,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.headerKeys = new HeaderKeys();
        this.isSaving = false;
        this.headerService.query()
            .subscribe((res: ResponseWrapper) => {
            this.headers = res.json;
            }, (res: ResponseWrapper) => this.onError(res.json));
        if (this.route.fragment['value'] === 'showEditHeaderButton') {
            this.showEditButton = true;
        }
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        if (this.header.id !== undefined) {
            this.subscribeToSaveResponse(
                this.headerService.update(this.header), closePopup);
        } else {
            this.subscribeToSaveResponse(
                this.headerService.create(this.header), closePopup);
        }
    }

    navigateToHeader() {
        this.router.navigate(['/header']);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    private subscribeToSaveResponse(result: Observable<Header>, closePopup: boolean) {
        result.subscribe((res: Header) =>
            this.onSaveSuccess(res, closePopup), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: Header, closePopup: boolean) {
        this.eventManager.broadcast({ name: 'headerListModification', content: 'OK' });
        this.eventManager.broadcast({ name: 'headerModified', content: result.id });
        this.eventManager.broadcast({ name: 'headerKeysUpdated', content: result });
        this.isSaving = false;
        if (closePopup) {
            this.activeModal.dismiss(result);
        }
    }

    private onSaveError() {
        this.isSaving = false;
    }
    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
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
    ) { }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if (params['id']) {
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
