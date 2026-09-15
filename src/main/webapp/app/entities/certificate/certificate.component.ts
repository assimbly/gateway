import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';import { AlertService } from 'app/core/util/alert.service';
import { ParseLinks } from 'app/core/util/parse-links.service';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SortDirective, SortByDirective, SortState } from 'app/shared/sort';

import { ICertificate } from 'app/shared/model/certificate.model';
import { AccountService } from 'app/core/auth/account.service';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { CertificateService } from './certificate.service';
import { CertificatePopupService } from './certificate-popup.service';

import { CertificateDeleteDialogComponent } from './certificate-delete-dialog.component';
import { CertificateUploadDialogComponent } from './certificate-upload-dialog.component';
import { CertificateUploadP12DialogComponent } from './certificate-uploadp12-dialog.component';
import { CertificateSelfSignDialogComponent } from './certificate-self-sign-dialog.component';

import { faDownload } from '@fortawesome/free-solid-svg-icons';

import { saveAs } from 'file-saver/FileSaver';

@Component({
  selector: 'jhi-certificate',
  templateUrl: './certificate.component.html',
  imports: [CommonModule, RouterModule, FontAwesomeModule, NgbModule, InfiniteScrollModule, SortDirective, SortByDirective],
})
export class CertificateComponent implements OnInit, OnDestroy {
  securities: ICertificate[];
  currentAccount: any;
  eventSubscriber: Subscription;
  itemsPerPage: number;
  links: any;
  page: any;
  sortState: SortState = { predicate: 'id', order: 'asc' };
  totalItems: number;
  faDownload = faDownload;

  constructor(
    protected certificateService: CertificateService,
	protected certificatePopupService: CertificatePopupService,
    protected alertService: AlertService,
	protected modalService: NgbModal,
    protected eventManager: EventManager,
    protected parseLinks: ParseLinks,
    protected accountService: AccountService
  ) {
    this.securities = [];
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
  }

  loadAll() {
    this.certificateService
      .query({
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sort(),
      })
      .subscribe(
        (res: HttpResponse<ICertificate[]>) => this.paginateSecurities(res.body, res.headers),
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

  	delete(certificate: ICertificate): void {
		const modalRef = this.modalService.open(CertificateDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.certificate = certificate;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}


  trackId(index: number, item: ICertificate) {
    return item.id;
  }

  registerChangeInSecurities() {
    this.eventSubscriber = this.eventManager.subscribe('certificateListModification', response => this.reset());
  }

  sort(): string[] {
    const { predicate, order } = this.sortState;
    const result = [predicate + ',' + order];
    if (predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  uploadCertificate() {
    console.log('Upload certificate');
	this.certificatePopupService.open(CertificateUploadDialogComponent as Component);
  }

  uploadP12Certificate() {
    console.log('Upload P12 certificate');
	this.certificatePopupService.open(CertificateUploadP12DialogComponent as Component);
  }

  generateCertificate() {
    console.log('Generate self-signed certificate');
	this.certificatePopupService.open(CertificateSelfSignDialogComponent as Component);
  }

  exportCertificate(id) {
    console.log('Export certificate');
    this.certificateService.find(id).subscribe(data => {
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

  protected paginateSecurities(data: ICertificate[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    for (let i = 0; i < data.length; i++) {
      this.securities.push(data[i]);
    }
  }

  protected onError(errorMessage: string) {
	this.alertService.addAlert({
	  type: 'danger',
	  message: errorMessage,
	});
  }
}
