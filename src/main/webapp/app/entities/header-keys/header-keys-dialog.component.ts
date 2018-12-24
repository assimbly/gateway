import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';
import { Header } from 'app/shared/model/header.model';
import { HeaderKeysPopupService } from './header-keys-popup.service';
import { HeaderKeysService } from './header-keys.service';
import { HeaderService } from '../header';
import { HttpResponse } from "@angular/common/http";

@Component({
    selector: 'jhi-header-keys-dialog',
    templateUrl: './header-keys-dialog.component.html'
})
export class HeaderKeysDialogComponent implements OnInit {
    selectedType: string;
    headerKeys: HeaderKeys;
    isSaving: boolean;

    headers: Header[];
    typeHeader: string;

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
        this.headerService.query().subscribe((res) => {
            this.headers = res.body;
        }, (res) => this.onError(res.body));
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

    private subscribeToSaveResponse(result: Observable<HttpResponse<IHeaderKeys>>) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body);
            }else{
                this.onSaveError()
            }
            }    
        )
    }

    private onSaveSuccess(result: HeaderKeys) {
        this.eventManager.broadcast({ name: 'headerKeysListModification', content: 'OK' });
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
    ) { }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if (params['id']) {
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
