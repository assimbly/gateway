import { Routes } from '@angular/router';

import { userRouteAccessService } from 'app/core/auth';
import { ApiListComponent } from './api-list.component';
import { ApiDetailComponent } from './api-detail.component';
import { ApiImportComponent } from './api-import.component';

/** The APIs pages. They live under /rest-apis: /api is where the Gateway's own REST resources are. */
export const apiRoute: Routes = [
  {
    path: 'rest-apis',
    component: ApiListComponent,
    data: { authorities: ['ROLE_USER'], pageTitle: 'global.title' },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'rest-apis/import',
    component: ApiImportComponent,
    data: { authorities: ['ROLE_ADMIN'], pageTitle: 'global.title' },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'rest-apis/:id',
    component: ApiDetailComponent,
    data: { authorities: ['ROLE_ADMIN'], pageTitle: 'global.title' },
    canActivate: [userRouteAccessService],
  },
];
