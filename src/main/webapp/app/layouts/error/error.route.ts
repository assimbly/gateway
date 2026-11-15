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
      errorMessage: 'You are not authorized to access this page.',
    },
    title: 'error.title',
  },
  {
    path: '404',
    loadComponent: () => import('./error'),
    data: {
      errorMessage: 'The page does not exist.',
    },
    title: 'error.title',
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
