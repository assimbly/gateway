import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { MaintenanceComponent } from './maintenance.component';
import { MaintenanceDetailComponent } from './maintenance-detail.component';
import { MaintenancePopupComponent } from './maintenance-dialog.component';
import { MaintenanceDeletePopupComponent } from './maintenance-delete-dialog.component';

export const maintenanceRoute: Routes = [
    {
        path: 'maintenance',
        component: MaintenanceComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Maintenances'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'maintenance/:id',
        component: MaintenanceDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Maintenances'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const maintenancePopupRoute: Routes = [
    {
        path: 'maintenance-new',
        component: MaintenancePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Maintenances'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'maintenance/:id/edit',
        component: MaintenancePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Maintenances'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'maintenance/:id/delete',
        component: MaintenanceDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Maintenances'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
