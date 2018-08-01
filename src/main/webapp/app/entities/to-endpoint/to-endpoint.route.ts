import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { ToEndpointComponent } from './to-endpoint.component';
import { ToEndpointDetailComponent } from './to-endpoint-detail.component';
import { ToEndpointPopupComponent } from './to-endpoint-dialog.component';
import { ToEndpointDeletePopupComponent } from './to-endpoint-delete-dialog.component';

export const toEndpointRoute: Routes = [
    {
        path: 'to-endpoint',
        component: ToEndpointComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'to-endpoint/:id',
        component: ToEndpointDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const toEndpointPopupRoute: Routes = [
    {
        path: 'to-endpoint-new',
        component: ToEndpointPopupComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'to-endpoint/:id/edit',
        component: ToEndpointPopupComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'to-endpoint/:id/delete',
        component: ToEndpointDeletePopupComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
