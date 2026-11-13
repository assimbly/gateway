import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes } from '@angular/router';
import { userRouteAccessService } from 'app/core/auth';
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IFlow, Flow } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
// A type-only import, so the editor stays out of this chunk
import type { FlowEditorComponent } from './editor/flow-editor.component';

const flowResolve: ResolveFn<IFlow> = route => {
  const id = route.params['id'];
  if (id) {
    return inject(FlowService)
      .find(id)
      .pipe(
        filter((response: HttpResponse<Flow>) => response.ok),
        map((flow: HttpResponse<Flow>) => flow.body!),
      );
  }
  return of(new Flow());
};

const loadFlowEditor = () => import('./editor/flow-editor.component').then(m => m.FlowEditorComponent);

const flowRoute: Routes = [
  {
    path: 'flow',
    loadComponent: () => import('./flow.component').then(m => m.FlowComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'flow/message-sender',
    loadComponent: () => import('./sender/flow-message-sender.component').then(m => m.FlowMessageSenderComponent),
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'flow/:id/stats',
    loadComponent: () => import('./stats/flow-stats-page.component').then(m => m.FlowStatsPageComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'flow/editor',
    loadComponent: loadFlowEditor,
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
    canDeactivate: [(component: FlowEditorComponent) => component.canDeactivate()],
  },
  {
    path: 'flow/editor/:id',
    loadComponent: loadFlowEditor,
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
    canDeactivate: [(component: FlowEditorComponent) => component.canDeactivate()],
  },
  {
    path: 'flow/editor/:id/:clone',
    loadComponent: loadFlowEditor,
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
    canDeactivate: [(component: FlowEditorComponent) => component.canDeactivate()],
  },
  {
    path: 'flow/new',
    loadComponent: () => import('./flow-update.component').then(m => m.FlowUpdateComponent),
    resolve: {
      flow: flowResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'flow/:id/edit',
    loadComponent: () => import('./flow-update.component').then(m => m.FlowUpdateComponent),
    resolve: {
      flow: flowResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
];

export default flowRoute;
