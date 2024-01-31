import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Connection } from 'app/shared/model/connection.model';
import { ConnectionService } from './connection.service';
import { ConnectionComponent } from './connection.component';
import { ConnectionDetailComponent } from './connection-detail.component';
import { ConnectionUpdateComponent } from './connection-update.component';
import { IConnection } from 'app/shared/model/connection.model';
import { ConnectionAllComponent } from './connection-all.component';
import { ConnectionPopupComponent } from 'app/entities/connection/connection-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConnectionResolve implements Resolve<IConnection> {
  constructor(private connection: ConnectionService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Connection> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.connection.find(id).pipe(
        filter((response: HttpResponse<Connection>) => response.ok),
        map((connection: HttpResponse<Connection>) => connection.body)
      );
    }
    return of(new Connection());
  }
}

export const connectionRoute: Routes = [
  {
    path: 'connection/all',
    component: ConnectionComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'connection',
    component: ConnectionAllComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'connection/:id/view',
    component: ConnectionDetailComponent,
    resolve: {
      connection: ConnectionResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'connection/new',
    component: ConnectionUpdateComponent,
    resolve: {
      connection: ConnectionResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'connection-all-new',
    component: ConnectionComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'connection/:id/edit',
    component: ConnectionUpdateComponent,
    resolve: {
      connection: ConnectionResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];

export const connectionPopupRoute: Routes = [
  {
    path: 'connection-new',
    component: ConnectionPopupComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
  {
    path: 'connection-all-new',
    component: ConnectionComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
  {
    path: 'connection/:id/edit',
    component: ConnectionPopupComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  }
];
