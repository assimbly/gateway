import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Gateway } from 'app/shared/model/gateway.model';
import { GatewayService } from './gateway.service';
import { GatewayComponent } from './gateway.component';
import { GatewayDetailComponent } from './gateway-detail.component';
import { GatewayUpdateComponent } from './gateway-update.component';
import { IGateway } from 'app/shared/model/gateway.model';

@Injectable({ providedIn: 'root' })
export class GatewayResolve implements Resolve<IGateway> {
  constructor(private service: GatewayService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Gateway> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Gateway>) => response.ok),
        map((gateway: HttpResponse<Gateway>) => gateway.body)
      );
    }
    return of(new Gateway());
  }
}

export const gatewayRoute: Routes = [
  {
    path: 'gateway',
    component: GatewayComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'gateway/:id/view',
    component: GatewayDetailComponent,
    resolve: {
      gateway: GatewayResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'gateway/new',
    component: GatewayUpdateComponent,
    resolve: {
      gateway: GatewayResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'gateway/:id/edit',
    component: GatewayUpdateComponent,
    resolve: {
      gateway: GatewayResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];