import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { ErrorEndpointComponent } from './error-endpoint.component';
import { ErrorEndpointDetailComponent } from './error-endpoint-detail.component';
import { ErrorEndpointPopupComponent } from './error-endpoint-dialog.component';
import { ErrorEndpointDeletePopupComponent } from './error-endpoint-delete-dialog.component';

export const errorEndpointRoute: Routes = [
    {
        path: 'error-endpoint',
        component: ErrorEndpointComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'error-endpoint/:id',
        component: ErrorEndpointDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const errorEndpointPopupRoute: Routes = [
    {
        path: 'error-endpoint-new',
        component: ErrorEndpointPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'error-endpoint/:id/edit',
        component: ErrorEndpointPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'error-endpoint/:id/delete',
        component: ErrorEndpointDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
