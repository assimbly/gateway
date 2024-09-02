import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IFlow, Flow } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { FlowComponent } from './flow.component';
import { FlowDetailComponent } from './flow-detail.component';
import { FlowUpdateComponent } from './flow-update.component';
import { FlowEditorComponent } from './editor/flow-editor.component';
import { FlowMessageSenderComponent } from './sender/flow-message-sender.component';

@Injectable({ providedIn: 'root' })
export class FlowResolve implements Resolve<IFlow> {
  constructor(private service: FlowService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Flow> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Flow>) => response.ok),
        map((flow: HttpResponse<Flow>) => flow.body)
      );
    }
    return of(new Flow());
  }
}

const flowRoute: Routes = [
  {
    path: 'flow',
    component: FlowComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'flow/message-sender',
    component: FlowMessageSenderComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'flow/editor',
    component: FlowEditorComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'flow/editor/:id',
    component: FlowEditorComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'flow/editor/:id/:clone',
    component: FlowEditorComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'flow/new',
    component: FlowUpdateComponent,
    resolve: {
      flow: FlowResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'flow/:id/edit',
    component: FlowUpdateComponent,
    resolve: {
      flow: FlowResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];

export default flowRoute;
