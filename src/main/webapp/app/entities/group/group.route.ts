import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Group } from 'app/shared/model/group.model';
import { GroupService } from './group.service';
import { GroupComponent } from './group.component';
import { GroupDetailComponent } from './group-detail.component';
import { GroupUpdateComponent } from './group-update.component';
import { GroupDeletePopupComponent } from './group-delete-dialog.component';
import { IGroup } from 'app/shared/model/group.model';

@Injectable({ providedIn: 'root' })
export class GroupResolve implements Resolve<IGroup> {
  constructor(private service: GroupService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Group> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Group>) => response.ok),
        map((group: HttpResponse<Group>) => group.body)
      );
    }
    return of(new Group());
  }
}

export const groupRoute: Routes = [
  {
    path: 'group',
    component: GroupComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Groups',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'group/:id/view',
    component: GroupDetailComponent,
    resolve: {
      group: GroupResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Groups',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'group/new',
    component: GroupUpdateComponent,
    resolve: {
      group: GroupResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Groups',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'group/:id/edit',
    component: GroupUpdateComponent,
    resolve: {
      group: GroupResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Groups',
    },
    canActivate: [UserRouteAccessService],
  },
];

export const groupPopupRoute: Routes = [
  {
    path: 'group/:id/delete',
    component: GroupDeletePopupComponent,
    resolve: {
      group: GroupResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'Groups',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
];
