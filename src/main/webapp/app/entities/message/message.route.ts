import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Message } from 'app/shared/model/message.model';
import { MessageService } from './message.service';
import { MessageComponent } from './message.component';
import { MessageDetailComponent } from './message-detail.component';
import { MessageUpdateComponent } from './message-update.component';
import { IMessage } from 'app/shared/model/message.model';
import { MessageAllComponent } from './message-all.component';
import { MessagePopupComponent } from 'app/entities/message/message-dialog.component';

@Injectable({ providedIn: 'root' })
export class MessageResolve implements Resolve<IMessage> {
  constructor(private service: MessageService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Message> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Message>) => response.ok),
        map((message: HttpResponse<Message>) => message.body)
      );
    }
    return of(new Message());
  }
}

export const messageRoute: Routes = [
  {
    path: 'message/all',
    component: MessageAllComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'message',
    component: MessageAllComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'message/:id/view',
    component: MessageDetailComponent,
    resolve: {
      message: MessageResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'message/new',
    component: MessageUpdateComponent,
    resolve: {
      message: MessageResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'message/:id/edit',
    component: MessageUpdateComponent,
    resolve: {
      message: MessageResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];

export const messagePopupRoute: Routes = [
  {
    path: 'message-new',
    component: MessagePopupComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
  {
    path: 'message/:id/edit',
    component: MessagePopupComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  }
];
