import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { GatewayComponent } from './gateway.component';
import { GatewayDetailComponent } from './gateway-detail.component';
import { GatewayPopupComponent } from './gateway-dialog.component';
import { GatewayDeletePopupComponent } from './gateway-delete-dialog.component';
import { GatewayImportPopupComponent } from './gateway-import-dialog.component';

export const gatewayRoute: Routes = [
    {
        path: 'gateway',
        component: GatewayComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'gateway/:id',
        component: GatewayDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const gatewayPopupRoute: Routes = [
    {
        path: 'gateway-new',
        component: GatewayPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'gateway/:id/edit',
        component: GatewayPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'gateway/:id/delete',
        component: GatewayDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'gateway/import',
        component: GatewayImportPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
