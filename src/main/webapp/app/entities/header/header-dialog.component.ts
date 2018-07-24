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
import { HeaderKeysService } from '../header-keys/header-keys.service';

@Component({
    selector: 'jhi-header-dialog',
    templateUrl: './header-dialog.component.html'
})
export class HeaderDialogComponent implements OnInit {

    header: Header;
    headers: Header[];
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
            (res: ResponseWrapper) => {
                this.headers = res.json;
                this.headerNames = this.headers.map((h) => h.name);
            },
            (res: ResponseWrapper) => this.onError(res.json)
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
        newHeaderKeys.isDisabled = false;
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
                this.headerKeys = res.json.filter((hk) => hk.headerId === this.header.id);
                this.headerKeys.forEach((headerKey) => {
                    headerKey.id = cloneHeader ? null : headerKey.id;
                });
                if (this.headerKeys.length === 0) {
                    this.headerKeys.push(new HeaderKeys());
                }
                this.header.id = cloneHeader ? null : this.header.id;
            });
        }else {
            this.headerKeys.push(new HeaderKeys());
            this.header.id = cloneHeader ? null : this.header.id;
        }
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
        this.activeModal.dismiss(result);

        this.headerKeys.forEach((headerKey) => {
            headerKey.headerId = result.id;
            if (headerKey.id) {
                this.headerKeysService.update(headerKey).subscribe((hk) => {
                    headerKey = hk;
                });
            } else {
                this.headerKeysService.create(headerKey).subscribe((hk) => {
                    headerKey = hk;
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
