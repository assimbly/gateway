import { Routes } from '@angular/router';

export const errorRoute: Routes = [
  {
    path: 'error',
    loadComponent: () => import('./error'),
    title: 'Error',
  },
  {
    path: 'accessdenied',
    loadComponent: () => import('./error'),
    data: {
      errorMessage: 'You are not authorized to access this page.',
    },
    title: 'Access denied',
  },
  {
    path: '404',
    loadComponent: () => import('./error'),
    data: {
      errorMessage: 'The page does not exist.',
    },
    title: 'Page not found',
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
