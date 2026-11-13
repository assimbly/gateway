import { Routes } from '@angular/router';

import { userRouteAccessService } from 'app/core/auth';

/** The APIs pages. They live under /rest-apis: /api is where the Gateway's own REST resources are. */
export const apiRoute: Routes = [
  {
    path: 'rest-apis',
    loadComponent: () => import('./api-list.component').then(m => m.ApiListComponent),
    data: { authorities: ['ROLE_USER'] },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'rest-apis/import',
    loadComponent: () => import('./api-import.component').then(m => m.ApiImportComponent),
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'rest-apis/:id',
    loadComponent: () => import('./api-detail.component').then(m => m.ApiDetailComponent),
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [userRouteAccessService],
  },
];
