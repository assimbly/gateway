import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

import { IHeader, Header } from 'app/shared/model/header.model';
import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';
import { HeaderService } from './header.service';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { HeaderKeysService } from '../header-keys/header-keys.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'jhi-header-update',
    templateUrl: './header-update.component.html'
})
export class HeaderUpdateComponent implements OnInit {
    header: IHeader;
    headers: IHeader[];
    headerNames: Array<string> = [];
    headerKeys: Array<HeaderKeys> = [];
    headerKeysKeys: Array<String> = [];
    isSaving: boolean;
    public typeHeader: string[] = ['constant', 'groovy', 'jsonpath', 'simple', 'xpath'];

    constructor(
        protected headerService: HeaderService,
        protected headerKeysService: HeaderKeysService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected activatedRoute: ActivatedRoute,
        protected router: Router
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ header }) => {
            this.header = header;
            if (this.activatedRoute.fragment['value'] === 'clone') {
                this.loadHeaderKeys(true);
            } else {
                this.loadHeaderKeys(false);
            }
        });
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.header.id) {
            this.subscribeToSaveResponse(this.headerService.update(this.header));
        } else {
            this.subscribeToSaveResponse(this.headerService.create(this.header));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IHeader>>) {
        result.subscribe((res: HttpResponse<IHeader>) => this.onSaveSuccess(res.body), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess(result: IHeader) {
        this.eventManager.broadcast({ name: 'headerListModification', content: 'OK' });
        this.eventManager.broadcast({ name: 'headerModified', content: result.id });
        this.eventManager.broadcast({ name: 'headerKeysUpdated', content: result });
        this.isSaving = false;

        this.headerKeys.forEach(headerKey => {
            headerKey.headerId = result.id;
            if (headerKey.id) {
                this.headerKeysService.update(headerKey).subscribe(hk => {
                    headerKey = hk.body;
                });
            } else {
                this.headerKeysService.create(headerKey).subscribe(hk => {
                    headerKey = hk.body;
                });
            }
        });

        this.navigateToHeader();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    deleteHeaderKeys(headerKey) {
        this.headerKeysService.delete(headerKey.id).subscribe(res => {
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
    }

    navigateToHeaderDetail(headerId: number) {
        this.router.navigate(['/header', headerId]);
    }

    private mapHeaderKeysKeys() {
        if (typeof this.headerKeys !== 'undefined') {
            this.headerKeysKeys = this.headerKeys.map(hk => hk.key);
            this.headerKeysKeys = this.headerKeysKeys.filter(k => k !== undefined);
        }
    }

    private loadHeaderKeys(cloneHeader: boolean) {
        let criteria = {
            'headerId.equals': this.header.id
        };

        if (this.header.id) {
            this.headerKeysService.query({ filter: 'headerid.equals=1' }).subscribe(res => {
                this.headerKeys = res.body.filter(headerkeys => headerkeys.headerId === this.header.id);
                this.header.id = cloneHeader ? null : this.header.id;
            });
        } else {
            let hk = new HeaderKeys();
            hk.type = this.typeHeader[0];
            this.headerKeys.push(hk);
            this.header.id = cloneHeader ? null : this.header.id;
        }
    }
}
