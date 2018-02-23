import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { CamelRouteComponent } from './camel-route.component';
import { CamelRouteConfigurationComponent } from './camel-route-configuration.component';
import { CamelRouteDetailComponent } from './camel-route-detail.component';
import { CamelRouteEditAllComponent } from './camel-route-edit-all.component';
import { CamelRoutePopupComponent } from './camel-route-dialog.component';
import { CamelRouteDeletePopupComponent } from './camel-route-delete-dialog.component';

export const camelRouteRoute: Routes = [
    {
        path: 'camel-route',
        component: CamelRouteComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'CamelRoutes'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'camel-route/edit-all',
        component: CamelRouteEditAllComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'CamelRoutes'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'camel-route/edit-all/:id',
        component: CamelRouteEditAllComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'CamelRoutes'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'camel-route/configuration',
        component: CamelRouteConfigurationComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'CamelRoutes'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'camel-route/:id',
        component: CamelRouteDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'CamelRoutes'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const camelRoutePopupRoute: Routes = [
    {
        path: 'camel-route-new',
        component: CamelRoutePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'CamelRoutes'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'camel-route/:id/edit',
        component: CamelRoutePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'CamelRoutes'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'camel-route/:id/delete',
        component: CamelRouteDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'CamelRoutes'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'camel-route/delete-all/:id',
        component: CamelRouteDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'CamelRoutes'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
