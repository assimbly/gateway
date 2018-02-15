import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { HeaderKeysComponent } from './header-keys.component';
import { HeaderKeysDetailComponent } from './header-keys-detail.component';
import { HeaderKeysPopupComponent } from './header-keys-dialog.component';
import { HeaderKeysDeletePopupComponent } from './header-keys-delete-dialog.component';

export const headerKeysRoute: Routes = [
    {
        path: 'header-keys',
        component: HeaderKeysComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'header-keys/:id',
        component: HeaderKeysDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const headerKeysPopupRoute: Routes = [
    {
        path: 'header-keys-new',
        component: HeaderKeysPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'header-keys/:id/edit',
        component: HeaderKeysPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'header-keys/:id/delete',
        component: HeaderKeysDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
