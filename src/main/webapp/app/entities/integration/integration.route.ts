import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Integration } from 'app/shared/model/integration.model';
import { IntegrationService } from './integration.service';
import { IntegrationComponent } from './integration.component';
import { IntegrationDetailComponent } from './integration-detail.component';
import { IntegrationUpdateComponent } from './integration-update.component';
import { IIntegration } from 'app/shared/model/integration.model';

@Injectable({ providedIn: 'root' })
export class IntegrationResolve implements Resolve<IIntegration> {
  constructor(private service: IntegrationService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Integration> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Integration>) => response.ok),
        map((integration: HttpResponse<Integration>) => integration.body)
      );
    }
    return of(new Integration());
  }
}

export const integrationRoute: Routes = [
  {
    path: 'integration',
    component: IntegrationComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'integration/:id/view',
    component: IntegrationDetailComponent,
    resolve: {
      integration: IntegrationResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'integration/new',
    component: IntegrationUpdateComponent,
    resolve: {
      integration: IntegrationResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'integration/:id/edit',
    component: IntegrationUpdateComponent,
    resolve: {
      integration: IntegrationResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];
