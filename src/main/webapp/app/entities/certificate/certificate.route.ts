import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes } from '@angular/router';
import { userRouteAccessService } from 'app/core/auth';
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Certificate, ICertificate } from 'app/shared/model/certificate.model';
import { CertificateService } from './certificate.service';

const certificateResolve: ResolveFn<ICertificate> = route => {
  const id = route.params['id'];
  if (id) {
    return inject(CertificateService)
      .find(id)
      .pipe(
        filter((response: HttpResponse<Certificate>) => response.ok),
        map((certificate: HttpResponse<Certificate>) => certificate.body!),
      );
  }
  return of(new Certificate());
};

export const certificateRoute: Routes = [
  {
    path: 'certificate',
    loadComponent: () => import('./certificate.component').then(m => m.CertificateComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'certificate/:id/view',
    loadComponent: () => import('./certificate-detail.component').then(m => m.CertificateDetailComponent),
    resolve: {
      certificate: certificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'certificate/new',
    loadComponent: () => import('./certificate-update.component').then(m => m.CertificateUpdateComponent),
    resolve: {
      certificate: certificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'certificate/:id/edit',
    loadComponent: () => import('./certificate-update.component').then(m => m.CertificateUpdateComponent),
    resolve: {
      certificate: certificateResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
];
