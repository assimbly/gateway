import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IHeader, Header } from 'app/shared/model/header.model';
import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';
import { HeaderService } from './header.service';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { HeaderKeysService } from '../header-keys/header-keys.service';
import { filter } from "rxjs/operators";

@Component({
    selector: 'jhi-header-dialog',
    templateUrl: './header-dialog.component.html'
})
export class HeaderDialogComponent implements OnInit {

    header: IHeader;
    headers: IHeader[];
    headerNames: Array<string> = [];
    headerKeys: Array<HeaderKeys> = [];
    headerKeysKeys: Array<String> = [];
    isSaving: boolean;
    public typeHeader: string[] = ['constant', 'xpath'];

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
        this.isSaving = false;
        this.headerService.query().subscribe(
            (res) => {
                this.headers = res.body;
                this.headerNames = this.headers.map((h) => h.name);
            },
            (res) => this.onError(res.body)
        );
        this.loadHeaderKeys(this.route.fragment['value'] === 'clone');
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

    deleteHeaderKeys(headerKey) {
        this.headerKeysService.delete(headerKey.id).subscribe((res) => {
            this.removeHeaderKeys(this.headerKeys.indexOf(headerKey));
        });
    }

    addHeaderKeys() {
        const newHeaderKeys = new HeaderKeys();
        (newHeaderKeys as any).isDisabled = false;
        newHeaderKeys.type = this.typeHeader[0];
        this.headerKeys.push(newHeaderKeys);
        this.mapHeaderKeysKeys();
    }

    removeHeaderKeys(i: number) {
        this.headerKeys.splice(i, 1);
        this.mapHeaderKeysKeys();
        if (this.headerKeys.length === 0) {
            this.addHeaderKeys();
        }
    }

    navigateToHeader() {
        this.router.navigate(['/header']);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    navigateToHeaderDetail(headerId: number) {
        this.router.navigate(['/header', headerId]);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    private mapHeaderKeysKeys() {
        if (typeof this.headerKeys !== 'undefined') {
            this.headerKeysKeys = this.headerKeys.map((hk) => hk.key);
            this.headerKeysKeys = this.headerKeysKeys.filter((k) => k !== undefined);
        }
    }

    private loadHeaderKeys(cloneHeader: boolean) {
        if (this.header.id) {
            this.headerKeysService.query().subscribe((res) => {
                this.headerKeys = res.body;
            });
        }else {
            let hk = new HeaderKeys();
            hk.type = this.typeHeader[0];
            this.headerKeys.push(hk);
            this.header.id = cloneHeader ? null : this.header.id;
        }
    }
    
    private subscribeToSaveResponse(result: Observable<HttpResponse<IHeader>>,closePopup) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body,closePopup);
            }else{
                this.onSaveError()
            }
            }    
        )
    }
    

    private onSaveSuccess(result: IHeader, closePopup: boolean) {
        this.eventManager.broadcast({ name: 'headerListModification', content: 'OK' });
        this.eventManager.broadcast({ name: 'headerModified', content: result.id });
        this.eventManager.broadcast({ name: 'headerKeysUpdated', content: result });
        this.isSaving = false;
        this.activeModal.dismiss(result);

        this.headerKeys.forEach((headerKey) => {
            headerKey.headerId = result.id;
            if (headerKey.id) {
                this.headerKeysService.update(headerKey).subscribe((hk) => {
                    headerKey = hk.body;
                });
            } else {
                this.headerKeysService.create(headerKey).subscribe((hk) => {
                    headerKey = hk.body;
                });
            }
        });
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
        private route: ActivatedRoute
    ) { }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
