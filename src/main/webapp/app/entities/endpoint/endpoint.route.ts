import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Endpoint } from 'app/shared/model/endpoint.model';
import { EndpointService } from './endpoint.service';
import { EndpointComponent } from './endpoint.component';
import { EndpointDetailComponent } from './endpoint-detail.component';
import { EndpointUpdateComponent } from './endpoint-update.component';
import { EndpointDeletePopupComponent } from './endpoint-delete-dialog.component';
import { IEndpoint } from 'app/shared/model/endpoint.model';

@Injectable({ providedIn: 'root' })
export class EndpointResolve implements Resolve<IEndpoint> {
  constructor(private service: EndpointService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Endpoint> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Endpoint>) => response.ok),
        map((endpoint: HttpResponse<Endpoint>) => endpoint.body)
      );
    }
    return of(new Endpoint());
  }
}

export const endpointRoute: Routes = [
  {
    path: 'endpoint',
    component: EndpointComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Endpoints',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'endpoint/:id/view',
    component: EndpointDetailComponent,
    resolve: {
      endpoint: EndpointResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Endpoints',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'endpoint/new',
    component: EndpointUpdateComponent,
    resolve: {
      endpoint: EndpointResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'Endpoints',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'endpoint/:id/edit',
    component: EndpointUpdateComponent,
    resolve: {
      endpoint: EndpointResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'Endpoints',
    },
    canActivate: [UserRouteAccessService],
  },
];

export const endpointPopupRoute: Routes = [
  {
    path: 'endpoint/:id/delete',
    component: EndpointDeletePopupComponent,
    resolve: {
      endpoint: EndpointResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'Endpoints',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
];
