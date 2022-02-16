import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';
import { EnvironmentVariablesComponent } from './environment-variables.component';
import { EnvironmentVariablesDetailComponent } from './environment-variables-detail.component';
import { EnvironmentVariablesUpdateComponent } from './environment-variables-update.component';
import { EnvironmentVariablesDeletePopupComponent } from './environment-variables-delete-dialog.component';
import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';

@Injectable({ providedIn: 'root' })
export class EnvironmentVariablesResolve implements Resolve<IEnvironmentVariables> {
  constructor(private service: EnvironmentVariablesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<EnvironmentVariables> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<EnvironmentVariables>) => response.ok),
        map((environmentVariables: HttpResponse<EnvironmentVariables>) => environmentVariables.body)
      );
    }
    return of(new EnvironmentVariables());
  }
}

export const environmentVariablesRoute: Routes = [
  {
    path: 'environment-variables',
    component: EnvironmentVariablesComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'environment-variables/:id/view',
    component: EnvironmentVariablesDetailComponent,
    resolve: {
      environmentVariables: EnvironmentVariablesResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'environment-variables/new',
    component: EnvironmentVariablesUpdateComponent,
    resolve: {
      environmentVariables: EnvironmentVariablesResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'environment-variables/:id/edit',
    component: EnvironmentVariablesUpdateComponent,
    resolve: {
      environmentVariables: EnvironmentVariablesResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];

export const environmentVariablesPopupRoute: Routes = [
  {
    path: 'environment-variables/:id/delete',
    component: EnvironmentVariablesDeletePopupComponent,
    resolve: {
      environmentVariables: EnvironmentVariablesResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
];
