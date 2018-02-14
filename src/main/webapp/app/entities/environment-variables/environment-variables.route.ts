import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { EnvironmentVariablesComponent } from './environment-variables.component';
import { EnvironmentVariablesDetailComponent } from './environment-variables-detail.component';
import { EnvironmentVariablesPopupComponent } from './environment-variables-dialog.component';
import { EnvironmentVariablesDeletePopupComponent } from './environment-variables-delete-dialog.component';

export const environmentVariablesRoute: Routes = [
    {
        path: 'environment-variables',
        component: EnvironmentVariablesComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'EnvironmentVariables'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'environment-variables/:id',
        component: EnvironmentVariablesDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'EnvironmentVariables'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const environmentVariablesPopupRoute: Routes = [
    {
        path: 'environment-variables-new',
        component: EnvironmentVariablesPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'EnvironmentVariables'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'environment-variables/:id/edit',
        component: EnvironmentVariablesPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'EnvironmentVariables'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'environment-variables/:id/delete',
        component: EnvironmentVariablesDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'EnvironmentVariables'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
