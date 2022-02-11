import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { ISecurity } from 'app/shared/model/security.model';
import { SecurityService } from './security.service';

// import { faSync } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'jhi-security-update',
  templateUrl: './security-update.component.html',
})
export class SecurityUpdateComponent implements OnInit {
  security: ISecurity;
  isSaving: boolean;
  certificateExpiry: string;

  constructor(protected securityService: SecurityService, protected activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ security }) => {
      this.security = security;
      this.certificateExpiry = this.security.certificateExpiry != null ? this.security.certificateExpiry.format(DATE_TIME_FORMAT) : null;
    });
  }

  previousState() {
    window.history.back();
  }

  add() {
    this.isSaving = true;

    this.security.certificateExpiry = this.certificateExpiry != null ? moment(this.certificateExpiry, DATE_TIME_FORMAT) : null;

    this.securityService.importCertificate(this.security.url, 'keystore.jks').subscribe(
      res => {
        const json = JSON.parse(res.body);

        for (let i = 0; i < json.certificates.certificate.length; i++) {
          const certificate = json.certificates.certificate[i];
          this.security.certificateName = certificate.certificateName;
          this.security.certificateFile = certificate.certificateFile;
          this.security.certificateExpiry = moment(certificate.certificateExpiry, DATE_TIME_FORMAT);
          if (this.security.id !== undefined) {
            this.subscribeToAddResponse(this.securityService.update(this.security));
          } else {
            this.subscribeToAddResponse(this.securityService.create(this.security));
          }
        }
      },
      err => console.log(err)
    );
  }

  remove() {
    this.isSaving = true;
    this.security.certificateExpiry = this.certificateExpiry != null ? moment(this.certificateExpiry, DATE_TIME_FORMAT) : null;

    this.securityService.findByUrl(this.security.url).subscribe(
      res => {
        const json = res.body;

        const observables: Observable<any>[] = [];

        for (let i = 0; i < json.certificates.certificate.length; i++) {
          const certificate = json.certificates.certificate[i];

          observables.push(this.securityService.deleteCertificate(certificate.certificateName));
        }

        forkJoin(observables).subscribe(dataArray => {
          // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
        });

        this.subscribeToRemoveResponse(this.securityService.remove(this.security.url));
      },
      err => console.log(err)
    );
  }

  renew() {
    this.isSaving = true;
    this.security.certificateExpiry = this.certificateExpiry != null ? moment(this.certificateExpiry, DATE_TIME_FORMAT) : null;
    this.securityService.findByUrl(this.security.url).subscribe(
      res => {
        const json = res.body;

        const observables: Observable<any>[] = [];

        for (let i = 0; i < json.certificates.certificate.length; i++) {
          const certificate = json.certificates.certificate[i];

          observables.push(this.securityService.deleteCertificate(certificate.certificateName));
        }

        forkJoin(observables).subscribe(dataArray => {
          this.securityService.remove(this.security.url).subscribe(res2 => {
            this.add();
          });
        });
      },
      err => console.log(err)
    );
  }

  protected subscribeToAddResponse(result: Observable<HttpResponse<ISecurity>>) {
    result.subscribe(
      (res: HttpResponse<ISecurity>) => this.onSaveSuccess(),
      (res: HttpErrorResponse) => this.onSaveError()
    );
  }

  protected subscribeToRemoveResponse(result: Observable<HttpResponse<ISecurity>>) {
    result.subscribe(
      (res: HttpResponse<ISecurity>) => this.onSaveSuccess(),
      (res: HttpErrorResponse) => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
}
