import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { ICertificate } from 'app/shared/model/certificate.model';
import { CertificateService } from './certificate.service';

@Component({
  selector: 'jhi-certificate-update',
  templateUrl: './certificate-update.component.html',
  imports: [FormsModule, FontAwesomeModule, AlertError],
})
export class CertificateUpdateComponent implements OnInit {
  certificate: ICertificate;
  isSaving: boolean;
  certificateExpiry: string;
  certificateType = 'root';
  errorMessage: string;

  constructor(
    protected certificateService: CertificateService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected eventManager: EventManager,
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ certificate }) => {
      this.certificate = certificate;
      this.certificateExpiry = this.certificate.certificateExpiry != null ? this.certificate.certificateExpiry.format(DATE_TIME_FORMAT) : null;
    });
  }

  previousState() {
    window.history.back();
  }

  /** Downloads the certificates of the url's domain; fails when they were added before (use Renew). */
  add() {
    this.run(
      this.certificateService
        .addDomainCertificates(this.domain(), this.certificateType)
        .pipe(switchMap(res => this.certificateService.createFromRuntimeResponse(res.body, this.certificate.url))),
    );
  }

  /** Removes the certificates of the url's domain from the truststore, and their records. */
  remove() {
    this.run(
      this.certificateService
        .deleteDomainCertificates(this.domain())
        .pipe(switchMap(() => this.certificateService.remove(this.certificate.url))),
    );
  }

  /** Downloads the certificates of the url's domain again and replaces the stored ones, and their records. */
  renew() {
    this.run(
      this.certificateService.renewDomainCertificates(this.domain(), this.certificateType).pipe(
        switchMap(res =>
          this.certificateService
            .remove(this.certificate.url)
            .pipe(switchMap(() => this.certificateService.createFromRuntimeResponse(res.body, this.certificate.url))),
        ),
      ),
    );
  }

  /** The host (with a non-default port) of the url, which identifies its certificates in the truststore. */
  protected domain(): string {
    return new URL(this.certificate.url).host;
  }

  protected run(action: Observable<any>) {
    this.isSaving = true;
    this.errorMessage = null;
    action.subscribe(
      () => this.onSaveSuccess(),
      (err: HttpErrorResponse) => this.onSaveError(err),
    );
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.router.navigate(['/certificate']).then(() => {
      this.eventManager.broadcast(new EventWithContent('certificateListModification', 'OK'));
    });
  }

  protected onSaveError(err: HttpErrorResponse) {
    this.isSaving = false;
    this.errorMessage = err.status === 409 ? 'The certificates of this url were already added, use Renew to download them again.' : err.error || err.message;
    console.log(err);
  }

  protected goBack() {
    window.history.back();
  }
}
