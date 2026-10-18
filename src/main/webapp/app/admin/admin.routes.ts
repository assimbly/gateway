import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';

import { API_EXPLORER_PATH } from './docs/api-definitions';
/* jhipster-needle-add-admin-module-import - JHipster will add admin modules imports here */

const routes: Routes = [
  {
    // Moved to the API Explorer. A guard instead of an absolute redirectTo, which would drop the navbar outlet.
    path: 'docs',
    canActivate: [() => inject(Router).createUrlTree([API_EXPLORER_PATH])],
    children: [],
  },
  {
    path: 'configuration',
    loadComponent: () => import('./configuration/configuration'),
    title: 'configuration.title',
  },
  {
    path: 'health',
    loadComponent: () => import('./health/health'),
    title: 'health.title',
  },
  {
    path: 'logs',
    loadComponent: () => import('./logs/logs'),
    title: 'logs.title',
  },
  {
    path: 'metrics',
    loadComponent: () => import('./metrics/metrics'),
    title: 'metrics.title',
  },
   {
     path: 'logviewer',
     loadComponent: () => import('./logviewer/logviewer.component'),
     title: 'logviewer.title',
   }
  // jhipster-needle-add-admin-route - JHipster will add admin routes here
];

export default routes;
