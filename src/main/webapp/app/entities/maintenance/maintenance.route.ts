import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Maintenance } from 'app/shared/model/maintenance.model';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceComponent } from './maintenance.component';
import { MaintenanceDetailComponent } from './maintenance-detail.component';
import { MaintenanceUpdateComponent } from './maintenance-update.component';
import { IMaintenance } from 'app/shared/model/maintenance.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceResolve implements Resolve<IMaintenance> {
  constructor(private service: MaintenanceService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Maintenance> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Maintenance>) => response.ok),
        map((maintenance: HttpResponse<Maintenance>) => maintenance.body)
      );
    }
    return of(new Maintenance());
  }
}

export const maintenanceRoute: Routes = [
  {
    path: 'maintenance',
    component: MaintenanceComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'maintenance/:id/view',
    component: MaintenanceDetailComponent,
    resolve: {
      maintenance: MaintenanceResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'maintenance/new',
    component: MaintenanceUpdateComponent,
    resolve: {
      maintenance: MaintenanceResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'maintenance/:id/edit',
    component: MaintenanceUpdateComponent,
    resolve: {
      maintenance: MaintenanceResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];