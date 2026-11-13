import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes, Router } from '@angular/router';
import { of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { userRouteAccessService } from 'app/core/auth';
import { IRoute, Route } from 'app/shared/model/route.model';
import { RouteService } from './route.service';

const routeResolve: ResolveFn<IRoute> = activatedRoute => {
  const id = activatedRoute.params['id'];
  if (id) {
    const router = inject(Router);
    return inject(RouteService)
      .find(id)
      .pipe(
        mergeMap((route: HttpResponse<Route>) => {
          if (route.body) {
            return of(route.body);
          } else {
            router.navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(new Route());
};

export const routeRoute: Routes = [
  {
    path: 'route',
    loadComponent: () => import('./route.component').then(m => m.RouteComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'route/:id/view',
    loadComponent: () => import('./route-detail.component').then(m => m.RouteDetailComponent),
    resolve: {
      route: routeResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'route/new',
    loadComponent: () => import('./route-update.component').then(m => m.RouteUpdateComponent),
    resolve: {
      route: routeResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'route/:id/edit',
    loadComponent: () => import('./route-update.component').then(m => m.RouteUpdateComponent),
    resolve: {
      route: routeResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
];
