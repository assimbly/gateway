import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { ServiceComponent } from './service.component';
import { ServiceDetailComponent } from './service-detail.component';
import { ServicePopupComponent } from './service-dialog.component';
import { ServiceDeletePopupComponent } from './service-delete-dialog.component';
import { ServiceAllComponent } from './service-all.component';

export const serviceRoute: Routes = [
    {
        path: 'service/all',
        component: ServiceComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'service',
        component: ServiceAllComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'service/:id',
        component: ServiceDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const servicePopupRoute: Routes = [
    {
        path: 'service-new',
        component: ServicePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'service-all-new',
        component: ServiceComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'service/:id/edit',
        component: ServicePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'service/:id/delete',
        component: ServiceDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
