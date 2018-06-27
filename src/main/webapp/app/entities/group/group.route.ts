import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { GroupComponent } from './group.component';
import { GroupDetailComponent } from './group-detail.component';
import { GroupPopupComponent } from './group-dialog.component';
import { GroupDeletePopupComponent } from './group-delete-dialog.component';

export const groupRoute: Routes = [
    {
        path: 'group',
        component: GroupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Groups'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'group/:id',
        component: GroupDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Groups'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const groupPopupRoute: Routes = [
    {
        path: 'group-new',
        component: GroupPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Groups'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'group/:id/edit',
        component: GroupPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Groups'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'group/:id/delete',
        component: GroupDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Groups'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
