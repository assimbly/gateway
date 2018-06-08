import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { HeaderKeys } from './header-keys.model';
import { HeaderKeysPopupService } from './header-keys-popup.service';
import { HeaderKeysService } from './header-keys.service';
import { Header, HeaderService } from '../header';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-header-keys-dialog',
    templateUrl: './header-keys-dialog.component.html'
})
export class HeaderKeysDialogComponent implements OnInit {
    selectedType: string;
    headerKeys: HeaderKeys;
    isSaving: boolean;

    headers: Header[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private headerKeysService: HeaderKeysService,
        private headerService: HeaderService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.headerService.query().subscribe((res: ResponseWrapper) => {
            this.headers = res.json;
            }, (res: ResponseWrapper) => this.onError(res.json));
    }
    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.headerKeys.id !== undefined) {
            this.subscribeToSaveResponse(
                this.headerKeysService.update(this.headerKeys));
        } else {
            this.subscribeToSaveResponse(
                this.headerKeysService.create(this.headerKeys));
        }
    }

    private subscribeToSaveResponse(result: Observable<HeaderKeys>) {
        result.subscribe((res: HeaderKeys) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: HeaderKeys) {
        this.eventManager.broadcast({ name: 'headerKeysListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackHeaderById(index: number, item: Header) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-header-keys-popup',
    template: ''
})
export class HeaderKeysPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private headerKeysPopupService: HeaderKeysPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.headerKeysPopupService
                    .open(HeaderKeysDialogComponent as Component, params['id']);
            } else {
                this.headerKeysPopupService
                    .open(HeaderKeysDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
