import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { FlowComponent } from './flow.component';
import { FlowConfigurationComponent } from './flow-configuration.component';
import { FlowDetailComponent } from './flow-detail.component';
import { FlowEditAllComponent } from './flow-edit-all.component';
import { FlowPopupComponent } from './flow-dialog.component';
import { FlowDeletePopupComponent } from './flow-delete-dialog.component';
import { FlowLiveModeComponent } from './flow-live-mode.component';

export const flowRoute: Routes = [
    {
        path: 'flow',
        component: FlowComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'flow/edit-all',
        component: FlowEditAllComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'flow/edit-all/:id',
        component: FlowEditAllComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'flow/configuration',
        component: FlowConfigurationComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'flow/:id',
        component: FlowDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'live-mode',
        component: FlowLiveModeComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const flowPopupRoute: Routes = [
    {
        path: 'flow-new',
        component: FlowPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'flow/:id/edit',
        component: FlowPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'flow/:id/delete',
        component: FlowDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
