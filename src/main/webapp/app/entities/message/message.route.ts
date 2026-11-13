import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes } from '@angular/router';
import { userRouteAccessService } from 'app/core/auth';
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IMessage, Message } from 'app/shared/model/message.model';
import { MessageService } from './message.service';

const messageResolve: ResolveFn<IMessage> = route => {
  const id = route.params['id'];
  if (id) {
    return inject(MessageService)
      .find(id)
      .pipe(
        filter((response: HttpResponse<Message>) => response.ok),
        map((message: HttpResponse<Message>) => message.body!),
      );
  }
  return of(new Message());
};

export const messageRoute: Routes = [
  {
    path: 'message/all',
    loadComponent: () => import('./message-all.component').then(m => m.MessageAllComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'message',
    loadComponent: () => import('./message-all.component').then(m => m.MessageAllComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'message/:id/view',
    loadComponent: () => import('./message-detail.component').then(m => m.MessageDetailComponent),
    resolve: {
      message: messageResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'message/new',
    loadComponent: () => import('./message-update.component').then(m => m.MessageUpdateComponent),
    resolve: {
      message: messageResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'message/:id/edit',
    loadComponent: () => import('./message-update.component').then(m => m.MessageUpdateComponent),
    resolve: {
      message: messageResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [userRouteAccessService],
  },
];
