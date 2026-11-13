import { Routes } from '@angular/router';

import { userRouteAccessService } from 'app/core/auth';

const adminOnly = { authorities: ['ROLE_ADMIN'] };

export const importRoute: Routes = [
  {
    path: 'import',
    loadComponent: () => import('./import.component').then(m => m.ImportComponent),
    data: adminOnly,
    canActivate: [userRouteAccessService],
  },
  {
    path: 'import/flow',
    loadComponent: () => import('./import-flow.component').then(m => m.ImportFlowComponent),
    data: adminOnly,
    canActivate: [userRouteAccessService],
  },
  {
    path: 'import/camel',
    loadComponent: () => import('./import-camel.component').then(m => m.ImportCamelComponent),
    data: adminOnly,
    canActivate: [userRouteAccessService],
  },
  {
    path: 'import/script',
    loadComponent: () => import('./import-script.component').then(m => m.ImportScriptComponent),
    data: adminOnly,
    canActivate: [userRouteAccessService],
  },
];
