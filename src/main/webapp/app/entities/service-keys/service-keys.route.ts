import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { ServiceKeysComponent } from './service-keys.component';
import { ServiceKeysDetailComponent } from './service-keys-detail.component';
import { ServiceKeysPopupComponent } from './service-keys-dialog.component';
import { ServiceKeysDeletePopupComponent } from './service-keys-delete-dialog.component';

export const serviceKeysRoute: Routes = [
    {
        path: 'service-keys',
        component: ServiceKeysComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ServiceKeys'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'service-keys/:id',
        component: ServiceKeysDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ServiceKeys'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const serviceKeysPopupRoute: Routes = [
    {
        path: 'service-keys-new',
        component: ServiceKeysPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ServiceKeys'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'service-keys/:id/edit',
        component: ServiceKeysPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ServiceKeys'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'service-keys/:id/delete',
        component: ServiceKeysDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ServiceKeys'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
