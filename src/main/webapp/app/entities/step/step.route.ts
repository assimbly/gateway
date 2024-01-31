import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Step } from 'app/shared/model/step.model';
import { StepService } from './step.service';
import { StepComponent } from './step.component';
import { StepDetailComponent } from './step-detail.component';
import { StepUpdateComponent } from './step-update.component';
import { IStep } from 'app/shared/model/step.model';

@Injectable({ providedIn: 'root' })
export class StepResolve implements Resolve<IStep> {
  constructor(private service: StepService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Step> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Step>) => response.ok),
        map((step: HttpResponse<Step>) => step.body)
      );
    }
    return of(new Step());
  }
}

export const stepRoute: Routes = [
  {
    path: 'step',
    component: StepComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'step/:id/view',
    component: StepDetailComponent,
    resolve: {
      step: StepResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'step/new',
    component: StepUpdateComponent,
    resolve: {
      step: StepResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'step/:id/edit',
    component: StepUpdateComponent,
    resolve: {
      step: StepResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];
