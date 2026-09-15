import { Routes } from '@angular/router';

export const errorRoute: Routes = [
  {
    path: 'error',
    loadComponent: () => import('./error'),
    title: 'error.title',
  },
  {
    path: 'accessdenied',
    loadComponent: () => import('./error'),
    data: {
      errorMessage: 'error.http.403',
    },
    title: 'error.title',
  },
  {
    path: '404',
    loadComponent: () => import('./error'),
    data: {
      errorMessage: 'error.http.404',
    },
    title: 'error.title',
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
