import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes } from '@angular/router';
import { userRouteAccessService } from 'app/core/auth';
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Connection, IConnection } from 'app/shared/model/connection.model';
import { ConnectionService } from './connection.service';

const connectionResolve: ResolveFn<IConnection> = route => {
  const id = route.params['id'];
  if (id) {
    return inject(ConnectionService)
      .find(id)
      .pipe(
        filter((response: HttpResponse<Connection>) => response.ok),
        map((connection: HttpResponse<Connection>) => connection.body!),
      );
  }
  return of(new Connection());
};

export const connectionRoute: Routes = [
  {
    path: 'connection/all',
    title: 'Connections',
    loadComponent: () => import('./connection.component').then(m => m.ConnectionComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'connection',
    title: 'Connections',
    loadComponent: () => import('./connection-all.component').then(m => m.ConnectionAllComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'connection/:id/view',
    title: 'Connection',
    loadComponent: () => import('./connection-detail.component').then(m => m.ConnectionDetailComponent),
    resolve: {
      connection: connectionResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'connection/new',
    title: 'Connection',
    loadComponent: () => import('./connection-update.component').then(m => m.ConnectionUpdateComponent),
    resolve: {
      connection: connectionResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'connection-all-new',
    title: 'Connection',
    loadComponent: () => import('./connection.component').then(m => m.ConnectionComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'connection/:id/edit',
    title: 'Connection',
    loadComponent: () => import('./connection-update.component').then(m => m.ConnectionUpdateComponent),
    resolve: {
      connection: connectionResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
  },
];
