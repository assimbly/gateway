import { Routes } from '@angular/router';

import { userRouteAccessService } from 'app/core/auth';
import { Authority } from 'app/shared/jhipster/constants';

import { API_DEFINITIONS } from './admin/docs/api-definitions';
import { errorRoute } from './layouts/error/error.route';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home'),
    title: 'Flows',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar'),
    outlet: 'navbar',
  },
  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [userRouteAccessService],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'explorer',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [userRouteAccessService],
    children: [
      { path: '', pathMatch: 'full', redirectTo: API_DEFINITIONS[0].id },
      {
        path: ':definition',
        loadComponent: () => import('./admin/docs/docs'),
        title: 'Gateway REST API',
      },
    ],
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.route'),
  },
  {
    path: 'fluxygen',
    title: 'Export for Fluxygen',
    canActivate: [userRouteAccessService],
    loadComponent: () => import('./fluxygen/fluxygen'),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login'),
    title: 'Log in',
  },
  {
    path: '',
    loadChildren: () => import('./entities/entity.routes'),
  },
  ...errorRoute,
];

export default routes;
