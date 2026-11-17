import { Component, OnInit, OnDestroy, computed, signal, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { ParseLinks } from 'app/core/util/parse-links.service';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SortState, sortParams } from 'app/shared/sort';
import { SearchToolbar } from 'app/shared/filter';
import { EmptyState } from 'app/shared/empty-state';
import { DataTable, DataTableColumn, OverflowActionDirective, PrimaryActionDirective, RowActions, Truncate } from 'app/shared/table';

import { ICertificate } from 'app/shared/model/certificate.model';
import { AccountService } from 'app/core/auth/account.service';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { CertificateService } from './certificate.service';
import { CertificatePopupService } from './certificate-popup.service';

import { CertificateDeleteDialogComponent } from './certificate-delete-dialog.component';
import { CertificateUploadDialogComponent } from './certificate-upload-dialog.component';
import { CertificateUploadP12DialogComponent } from './certificate-uploadp12-dialog.component';
import { CertificateSelfSignDialogComponent } from './certificate-self-sign-dialog.component';

import { saveAs } from 'app/shared/util/save-as';

@Component({
  selector: 'jhi-certificate',
  templateUrl: './certificate.component.html',
  imports: [
    RouterModule,
    FontAwesomeModule,
    NgbModule,
    EmptyState,
    SearchToolbar,
    DataTable,
    RowActions,
    PrimaryActionDirective,
    OverflowActionDirective,
    Truncate,
    NgTemplateOutlet,
  ],
})
export class CertificateComponent implements OnInit, OnDestroy {
  protected certificateService = inject(CertificateService);
  protected certificatePopupService = inject(CertificatePopupService);
  protected alertService = inject(AlertService);
  protected modalService = inject(NgbModal);
  protected eventManager = inject(EventManager);
  protected parseLinks = inject(ParseLinks);
  protected accountService = inject(AccountService);

  readonly securities = signal<ICertificate[]>([]);
  currentAccount: any;
  eventSubscriber!: Subscription;
  itemsPerPage: number;
  links: any;
  page: any;
  readonly sortState = signal<SortState>({ predicate: 'certificateName', order: 'asc' });
  totalItems!: number;
  readonly searchText = signal('');
  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly columns: DataTableColumn[] = [
    { key: 'certificateName', header: 'Name', sortable: true },
    { key: 'url', header: 'URL', sortable: true },
    { key: 'certificateExpiry', header: 'Expiry', sortable: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  constructor() {
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
  }

  loadAll() {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.certificateService
      .query({
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sort(),
      })
      .subscribe(
        (res: HttpResponse<ICertificate[]>) => this.paginateSecurities(res.body!, res.headers),
        (res: HttpErrorResponse) => this.onError(res.message),
      );
  }

  reset() {
    this.page = 0;
    this.securities.set([]);
    this.loadAll();
  }

  loadPage(page: number) {
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
    // the dialog broadcasts 'certificateListModification' after deleting, which reloads the list
  }

  /** With no Certificate at all, the list gives way to an explanation of Certificates and how to add the first. */
  readonly showEmptyState = computed(() => !this.loading() && !this.loadFailed() && !this.securities().length);

  readonly filteredCertificates = computed(() => {
    const query = this.searchText().toLocaleLowerCase();
    let result = this.securities();
    if (query) {
      result = result.filter(
        item => (item.certificateName ?? '').toLocaleLowerCase().includes(query) || (item.url ?? '').toLocaleLowerCase().includes(query),
      );
    }
    return result;
  });

  onSortChange() {
    this.reset();
  }

  registerChangeInSecurities() {
    this.eventSubscriber = this.eventManager.subscribe('certificateListModification', response => this.reset());
  }

  sort(): string[] {
    return sortParams(this.sortState(), 'id');
  }

  uploadCertificate() {
    this.certificatePopupService.open(CertificateUploadDialogComponent as Component);
  }

  uploadP12Certificate() {
    this.certificatePopupService.open(CertificateUploadP12DialogComponent as Component);
  }

  generateCertificate() {
    this.certificatePopupService.open(CertificateSelfSignDialogComponent as Component);
  }

  exportCertificate(id: number) {
    this.certificateService.find(id).subscribe(data => {
      const certificate = data.body;
      let exportFileName = 'certificate';

      if (certificate!.certificateName!.startsWith('Generic') || certificate!.certificateName!.startsWith('Self-Signed')) {
        exportFileName = certificate!.certificateName!.substring(
          certificate!.certificateName!.indexOf('(') + 1,
          certificate!.certificateName!.lastIndexOf(')'),
        );
      } else {
        exportFileName = certificate!.certificateName!;
      }

      const blob = new Blob([certificate!.certificateFile!], { type: 'plain/text' });
      saveAs(blob, `${exportFileName}.cer`);
    });
  }

  protected paginateSecurities(data: ICertificate[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link')!);
    this.totalItems = parseInt(headers.get('X-Total-Count')!, 10);
    const body = data ?? [];
    if (this.page > 0) {
      this.securities.update(securities => [...securities, ...body]);
    } else {
      this.securities.set(body);
    }
    this.loading.set(false);
  }

  protected onError(errorMessage: string) {
    this.loading.set(false);
    this.loadFailed.set(true);
    this.alertService.addAlert({
      type: 'danger',
      message: errorMessage,
    });
  }
}
