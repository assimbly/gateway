import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes } from '@angular/router';
import { userRouteAccessService } from 'app/core/auth';
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EnvironmentVariables, IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';

const environmentVariablesResolve: ResolveFn<IEnvironmentVariables> = route => {
  const id = route.params['id'];
  if (id) {
    return inject(EnvironmentVariablesService)
      .find(id)
      .pipe(
        filter((response: HttpResponse<EnvironmentVariables>) => response.ok),
        map((environmentVariables: HttpResponse<EnvironmentVariables>) => environmentVariables.body!),
      );
  }
  return of(new EnvironmentVariables());
};

export const environmentVariablesRoute: Routes = [
  {
    path: 'environment-variables',
    loadComponent: () => import('./environment-variables.component').then(m => m.EnvironmentVariablesComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'environment-variables/:id/view',
    loadComponent: () => import('./environment-variables-detail.component').then(m => m.EnvironmentVariablesDetailComponent),
    resolve: {
      environmentVariables: environmentVariablesResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'environment-variables/new',
    loadComponent: () => import('./environment-variables-update.component').then(m => m.EnvironmentVariablesUpdateComponent),
    resolve: {
      environmentVariables: environmentVariablesResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'environment-variables/:id/edit',
    loadComponent: () => import('./environment-variables-update.component').then(m => m.EnvironmentVariablesUpdateComponent),
    resolve: {
      environmentVariables: environmentVariablesResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
  },
];
