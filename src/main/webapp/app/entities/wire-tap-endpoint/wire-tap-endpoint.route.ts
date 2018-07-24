import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { WireTapEndpointComponent } from './wire-tap-endpoint.component';
import { WireTapEndpointDetailComponent } from './wire-tap-endpoint-detail.component';
import { WireTapEndpointPopupComponent } from './wire-tap-endpoint-dialog.component';
import { WireTapEndpointEditComponent } from './wire-tap-endpoint-edit.component';
import { WireTapEndpointDeletePopupComponent } from './wire-tap-endpoint-delete-dialog.component';

export const wireTapEndpointRoute: Routes = [
    {
        path: 'wire-tap-endpoint',
        component: WireTapEndpointComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'wire-tap-endpoint/:id',
        component: WireTapEndpointDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'wire-tap-endpoint-create',
        component: WireTapEndpointEditComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'wire-tap-endpoint-edit/:id',
        component: WireTapEndpointEditComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const wireTapEndpointPopupRoute: Routes = [
    {
        path: 'wire-tap-endpoint-new',
        component: WireTapEndpointPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'wire-tap-endpoint/:id/edit',
        component: WireTapEndpointPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'wire-tap-endpoint/:id/delete',
        component: WireTapEndpointDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
