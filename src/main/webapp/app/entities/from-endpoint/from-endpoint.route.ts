import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { FromEndpointComponent } from './from-endpoint.component';
import { FromEndpointDetailComponent } from './from-endpoint-detail.component';
import { FromEndpointPopupComponent } from './from-endpoint-dialog.component';
import { FromEndpointDeletePopupComponent } from './from-endpoint-delete-dialog.component';

export const fromEndpointRoute: Routes = [
    {
        path: 'from-endpoint',
        component: FromEndpointComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'from-endpoint/:id',
        component: FromEndpointDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const fromEndpointPopupRoute: Routes = [
    {
        path: 'from-endpoint-new',
        component: FromEndpointPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'from-endpoint/:id/edit',
        component: FromEndpointPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'from-endpoint/:id/delete',
        component: FromEndpointDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
