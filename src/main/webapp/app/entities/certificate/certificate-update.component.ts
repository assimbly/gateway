import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { KEYSTORE_PWD } from 'app/app.constants';

import { Router } from '@angular/router';

import { ICertificate } from 'app/shared/model/certificate.model';
import { CertificateService } from './certificate.service';

// import { faSync } from '@fortawesome/free-solid-svg-icons';

@Component({
  standalone: false,
  selector: 'jhi-certificate-update',
  templateUrl: './certificate-update.component.html',
})
export class CertificateUpdateComponent implements OnInit {
  certificate: ICertificate;
  isSaving: boolean;
  certificateExpiry: string;

  constructor(protected certificateService: CertificateService, protected activatedRoute: ActivatedRoute, protected router: Router,) {}

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

  add() {
    this.isSaving = true;

    this.certificate.certificateExpiry = this.certificateExpiry != null ? dayjs(this.certificateExpiry, DATE_TIME_FORMAT) : null;

    this.certificateService.importCertificate(this.certificate.url, 'truststore.jks', KEYSTORE_PWD).subscribe(
      res => {
        const json = JSON.parse(res.body);

        for (let i = 0; i < json.certificates.certificate.length; i++) {
          const certificate = json.certificates.certificate[i];
          this.certificate.certificateName = certificate.certificateName;
          this.certificate.certificateFile = certificate.certificateFile;
          this.certificate.certificateExpiry = dayjs(certificate.certificateExpiry, DATE_TIME_FORMAT);
          if (this.certificate.id !== undefined) {
            this.subscribeToAddResponse(this.certificateService.update(this.certificate));
          } else {
            this.subscribeToAddResponse(this.certificateService.create(this.certificate));
          }
        }
      },
      err => console.log(err)
    );
  }

  remove() {
    this.isSaving = true;
    this.certificate.certificateExpiry = this.certificateExpiry != null ? dayjs(this.certificateExpiry, DATE_TIME_FORMAT) : null;

    this.certificateService.findByUrl(this.certificate.url).subscribe(
      res => {
        const json = res.body;

        const observables: Observable<any>[] = [];

        for (let i = 0; i < json.certificates.certificate.length; i++) {
          const certificate = json.certificates.certificate[i];

          observables.push(this.certificateService.deleteCertificate(certificate.certificateName));
        }

        forkJoin(observables).subscribe(dataArray => {
          // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
        });

        this.subscribeToRemoveResponse(this.certificateService.remove(this.certificate.url));
      },
      err => console.log(err)
    );
  }

  renew() {
    this.isSaving = true;
    this.certificate.certificateExpiry = this.certificateExpiry != null ? dayjs(this.certificateExpiry, DATE_TIME_FORMAT) : null;
    this.certificateService.findByUrl(this.certificate.url).subscribe(
      res => {
        const json = res.body;

        const observables: Observable<any>[] = [];

        for (let i = 0; i < json.certificates.certificate.length; i++) {
          const certificate = json.certificates.certificate[i];

          observables.push(this.certificateService.deleteCertificate(certificate.certificateName));
        }

        forkJoin(observables).subscribe(dataArray => {
          this.certificateService.remove(this.certificate.url).subscribe(res2 => {
            this.add();
          });
        });
      },
      err => console.log(err)
    );
  }

  protected subscribeToAddResponse(result: Observable<HttpResponse<ICertificate>>) {
    result.subscribe(
      (res: HttpResponse<ICertificate>) => this.onSaveSuccess(),
      (res: HttpErrorResponse) => this.onSaveError()
    );
  }

  protected subscribeToRemoveResponse(result: Observable<HttpResponse<ICertificate>>) {
    result.subscribe(
      (res: HttpResponse<ICertificate>) => this.onSaveSuccess(),
      (res: HttpErrorResponse) => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.router.navigate(['/certificate']);
  }

  protected onSaveError() {
    this.isSaving = false;
  }

  protected goBack() {
      window.history.back();
  }

}
