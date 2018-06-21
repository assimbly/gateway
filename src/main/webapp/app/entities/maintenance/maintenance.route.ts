import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { MaintenanceComponent } from './maintenance.component';

export const maintenanceRoute: Routes = [
    {
        path: 'maintenance',
        component: MaintenanceComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Maintenance'
        },
        canActivate: [UserRouteAccessService]
    }
];
