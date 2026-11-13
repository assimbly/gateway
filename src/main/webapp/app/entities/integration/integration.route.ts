import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes } from '@angular/router';
import { userRouteAccessService } from 'app/core/auth';
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IIntegration, Integration } from 'app/shared/model/integration.model';
import { IntegrationService } from './integration.service';

const integrationResolve: ResolveFn<IIntegration> = route => {
  const id = route.params['id'];
  if (id) {
    return inject(IntegrationService)
      .find(id)
      .pipe(
        filter((response: HttpResponse<Integration>) => response.ok),
        map((integration: HttpResponse<Integration>) => integration.body!),
      );
  }
  return of(new Integration());
};

export const integrationRoute: Routes = [
  {
    path: 'integration',
    loadComponent: () => import('./integration.component').then(m => m.IntegrationComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'integration/:id/view',
    loadComponent: () => import('./integration-detail.component').then(m => m.IntegrationDetailComponent),
    resolve: {
      integration: integrationResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'integration/new',
    loadComponent: () => import('./integration-update.component').then(m => m.IntegrationUpdateComponent),
    resolve: {
      integration: integrationResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'integration/:id/edit',
    loadComponent: () => import('./integration-update.component').then(m => m.IntegrationUpdateComponent),
    resolve: {
      integration: integrationResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
  },
];
