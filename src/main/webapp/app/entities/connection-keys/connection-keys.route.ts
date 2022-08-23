import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';
import { ConnectionKeysService } from './connection-keys.service';
import { ConnectionKeysComponent } from './connection-keys.component';
import { ConnectionKeysDetailComponent } from './connection-keys-detail.component';
import { ConnectionKeysUpdateComponent } from './connection-keys-update.component';
import { IConnectionKeys } from 'app/shared/model/connection-keys.model';

@Injectable({ providedIn: 'root' })
export class ConnectionKeysResolve implements Resolve<IConnectionKeys> {
  constructor(private connection: ConnectionKeysService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ConnectionKeys> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.connection.find(id).pipe(
        filter((response: HttpResponse<ConnectionKeys>) => response.ok),
        map((connectionKeys: HttpResponse<ConnectionKeys>) => connectionKeys.body)
      );
    }
    return of(new ConnectionKeys());
  }
}

export const connectionKeysRoute: Routes = [
  {
    path: 'connection-keys',
    component: ConnectionKeysComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'connection-keys/:id/view',
    component: ConnectionKeysDetailComponent,
    resolve: {
      connectionKeys: ConnectionKeysResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'connection-keys/new',
    component: ConnectionKeysUpdateComponent,
    resolve: {
      connectionKeys: ConnectionKeysResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'connection-keys/:id/edit',
    component: ConnectionKeysUpdateComponent,
    resolve: {
      connectionKeys: ConnectionKeysResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];
