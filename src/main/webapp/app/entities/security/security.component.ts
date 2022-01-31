import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { Router } from '@angular/router';

import { ISecurity } from 'app/shared/model/security.model';
import { AccountService } from 'app/core';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { SecurityService } from './security.service';

import { faDownload } from '@fortawesome/free-solid-svg-icons';

import { saveAs } from 'file-saver/FileSaver';

@Component({
    selector: 'jhi-security',
    templateUrl: './security.component.html'
})
export class SecurityComponent implements OnInit, OnDestroy {
    securities: ISecurity[];
    currentAccount: any;
    eventSubscriber: Subscription;
    itemsPerPage: number;
    links: any;
    page: any;
    predicate: any;
    reverse: any;
    totalItems: number;
    faDownload = faDownload;

    constructor(
        protected securityService: SecurityService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected parseLinks: JhiParseLinks,
        protected accountService: AccountService,
        protected router: Router
    ) {
        this.securities = [];
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = 0;
        this.links = {
            last: 0
        };
        this.predicate = 'id';
        this.reverse = true;
    }

    loadAll() {
        this.securityService
            .query({
                page: this.page,
                size: this.itemsPerPage,
                sort: this.sort()
            })
            .subscribe(
                (res: HttpResponse<ISecurity[]>) => this.paginateSecurities(res.body, res.headers),
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    reset() {
        this.page = 0;
        this.securities = [];
        this.loadAll();
    }

    loadPage(page) {
        this.page = page;
        this.loadAll();
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.registerChangeInSecurities();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: ISecurity) {
        return item.id;
    }

    registerChangeInSecurities() {
        this.eventSubscriber = this.eventManager.subscribe('securityListModification', response => this.reset());
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    uploadCertificate() {
        console.log('Upload certificate');
        this.router.navigate(['/', { outlets: { popup: ['upload'] } }]);
    }

    uploadP12Certificate() {
        console.log('Upload P12 certificate');
        this.router.navigate(['/', { outlets: { popup: ['uploadp12'] } }]);
    }

    generateCertificate() {
        console.log('Generate self-signed certificate');
        this.router.navigate(['/', { outlets: { popup: ['self-sign'] } }]);
    }

    exportCertificate(id) {
        console.log('Export certificate');
        this.securityService.find(id).subscribe(data => {
            const certificate = data.body;
            let exportFileName = 'certificate';

            if (certificate.certificateName.startsWith('Generic') || certificate.certificateName.startsWith('Self-Signed')) {
                exportFileName = certificate.certificateName.substring(
                    certificate.certificateName.indexOf('(') + 1,
                    certificate.certificateName.lastIndexOf(')')
                );
            } else {
                exportFileName = certificate.certificateName;
            }

            const blob = new Blob([certificate.certificateFile], { type: 'plain/text' });
            saveAs(blob, `${exportFileName}.cer`);
        });
    }

    protected paginateSecurities(data: ISecurity[], headers: HttpHeaders) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
        for (let i = 0; i < data.length; i++) {
            this.securities.push(data[i]);
        }
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
