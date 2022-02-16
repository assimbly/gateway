import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Certificate } from 'app/shared/model/certificate.model';
import { CertificateService } from './certificate.service';
import { CertificateComponent } from './certificate.component';
import { CertificateDetailComponent } from './certificate-detail.component';
import { CertificateUpdateComponent } from './certificate-update.component';
import { CertificateDeletePopupComponent } from './certificate-delete-dialog.component';
import { CertificateSelfSignPopupComponent } from 'app/entities/certificate/certificate-self-sign-dialog.component';
import { CertificateUploadP12PopupComponent } from 'app/entities/certificate/certificate-uploadp12-dialog.component';
import { CertificateUploadPopupComponent } from 'app/entities/certificate/certificate-upload-dialog.component';

import { ICertificate } from 'app/shared/model/certificate.model';

@Injectable({ providedIn: 'root' })
export class CertificateResolve implements Resolve<ICertificate> {
  constructor(private service: CertificateService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Certificate> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Certificate>) => response.ok),
        map((certificate: HttpResponse<Certificate>) => certificate.body)
      );
    }
    return of(new Certificate());
  }
}

export const certificateRoute: Routes = [
  {
    path: 'certificate',
    component: CertificateComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'certificate/:id/view',
    component: CertificateDetailComponent,
    resolve: {
      certificate: CertificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'certificate/new',
    component: CertificateUpdateComponent,
    resolve: {
      certificate: CertificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'certificate/:id/edit',
    component: CertificateUpdateComponent,
    resolve: {
      certificate: CertificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];

export const certificatePopupRoute: Routes = [
  {
    path: 'certificate/:id/delete',
    component: CertificateDeletePopupComponent,
    resolve: {
      certificate: CertificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
  {
    path: 'upload',
    component: CertificateUploadPopupComponent,
    resolve: {
      certificate: CertificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
  {
    path: 'uploadp12',
    component: CertificateUploadP12PopupComponent,
    resolve: {
      certificate: CertificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
  {
    path: 'self-sign',
    component: CertificateSelfSignPopupComponent,
    resolve: {
      certificate: CertificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
];
