import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ResolveFn, Routes } from '@angular/router';
import { userRouteAccessService } from 'app/core/auth';
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Broker, IBroker } from 'app/shared/model/broker.model';
import { BrokerService } from './broker.service';

const brokerResolve: ResolveFn<IBroker> = route => {
  const id = route.params['id'];
  if (id) {
    return inject(BrokerService)
      .find(id)
      .pipe(
        filter((response: HttpResponse<Broker>) => response.ok),
        map((broker: HttpResponse<Broker>) => broker.body!),
      );
  }
  return of(new Broker());
};

export const brokerRoute: Routes = [
  {
    path: 'broker',
    loadComponent: () => import('./broker.component').then(m => m.BrokerComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'broker/:id/view',
    loadComponent: () => import('./broker-detail.component').then(m => m.BrokerDetailComponent),
    resolve: {
      broker: brokerResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'broker/new',
    loadComponent: () => import('./broker-update.component').then(m => m.BrokerUpdateComponent),
    resolve: {
      broker: brokerResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'broker/:id/edit',
    loadComponent: () => import('./broker-update.component').then(m => m.BrokerUpdateComponent),
    resolve: {
      broker: brokerResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'broker/browser/message-browser',
    loadComponent: () => import('./browser/broker-message-browser.component').then(m => m.BrokerMessageBrowserComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
  {
    path: 'broker/sender/message-sender',
    loadComponent: () => import('./sender/broker-message-sender.component').then(m => m.BrokerMessageSenderComponent),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [userRouteAccessService],
  },
];
