import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ServiceKeys } from 'app/shared/model/service-keys.model';
import { ServiceKeysService } from './service-keys.service';
import { ServiceKeysComponent } from './service-keys.component';
import { ServiceKeysDetailComponent } from './service-keys-detail.component';
import { ServiceKeysUpdateComponent } from './service-keys-update.component';
import { ServiceKeysDeletePopupComponent } from './service-keys-delete-dialog.component';
import { IServiceKeys } from 'app/shared/model/service-keys.model';

@Injectable({ providedIn: 'root' })
export class ServiceKeysResolve implements Resolve<IServiceKeys> {
  constructor(private service: ServiceKeysService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ServiceKeys> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<ServiceKeys>) => response.ok),
        map((serviceKeys: HttpResponse<ServiceKeys>) => serviceKeys.body)
      );
    }
    return of(new ServiceKeys());
  }
}

export const serviceKeysRoute: Routes = [
  {
    path: 'service-keys',
    component: ServiceKeysComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'ServiceKeys',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'service-keys/:id/view',
    component: ServiceKeysDetailComponent,
    resolve: {
      serviceKeys: ServiceKeysResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'ServiceKeys',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'service-keys/new',
    component: ServiceKeysUpdateComponent,
    resolve: {
      serviceKeys: ServiceKeysResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'ServiceKeys',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'service-keys/:id/edit',
    component: ServiceKeysUpdateComponent,
    resolve: {
      serviceKeys: ServiceKeysResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'ServiceKeys',
    },
    canActivate: [UserRouteAccessService],
  },
];

export const serviceKeysPopupRoute: Routes = [
  {
    path: 'service-keys/:id/delete',
    component: ServiceKeysDeletePopupComponent,
    resolve: {
      serviceKeys: ServiceKeysResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'ServiceKeys',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
];
