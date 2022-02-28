import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Broker } from 'app/shared/model/broker.model';
import { BrokerService } from './broker.service';
import { BrokerComponent } from './broker.component';
import { BrokerDetailComponent } from './broker-detail.component';
import { BrokerUpdateComponent } from './broker-update.component';
import { BrokerDeletePopupComponent } from './broker-delete-dialog.component';
import { BrokerMessageSenderComponent } from 'app/entities/broker/sender/broker-message-sender.component';
import { IBroker } from 'app/shared/model/broker.model';
import { BrokerMessageBrowserComponent } from 'app/entities/broker/browser/broker-message-browser.component';

@Injectable({ providedIn: 'root' })
export class BrokerResolve implements Resolve<IBroker> {
  constructor(private service: BrokerService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Broker> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Broker>) => response.ok),
        map((broker: HttpResponse<Broker>) => broker.body)
      );
    }
    return of(new Broker());
  }
}

export const brokerRoute: Routes = [
  {
    path: 'broker',
    component: BrokerComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'broker/:id/view',
    component: BrokerDetailComponent,
    resolve: {
      broker: BrokerResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'broker/new',
    component: BrokerUpdateComponent,
    resolve: {
      broker: BrokerResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'broker/:id/edit',
    component: BrokerUpdateComponent,
    resolve: {
      broker: BrokerResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'broker/browser/message-browser',
    component: BrokerMessageBrowserComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'broker/sender/message-sender',
    component: BrokerMessageSenderComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];

export const brokerPopupRoute: Routes = [
  {
    path: 'broker/:id/delete',
    component: BrokerDeletePopupComponent,
    resolve: {
      broker: BrokerResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
];
