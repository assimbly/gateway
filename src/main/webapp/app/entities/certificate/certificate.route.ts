import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Certificate } from 'app/shared/model/certificate.model';
import { CertificateService } from './certificate.service';
import { CertificatePopupService } from './certificate-popup.service';

import { CertificateComponent } from './certificate.component';
import { CertificateDetailComponent } from './certificate-detail.component';
import { CertificateUpdateComponent } from './certificate-update.component';

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