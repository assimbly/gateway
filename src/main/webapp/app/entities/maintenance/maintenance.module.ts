import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    MaintenanceComponent,
    MaintenanceDetailComponent,
    MaintenanceUpdateComponent,
    MaintenanceDeletePopupComponent,
    MaintenanceDeleteDialogComponent,
    maintenanceRoute,
    maintenancePopupRoute
} from './';

const ENTITY_STATES = [...maintenanceRoute, ...maintenancePopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        MaintenanceComponent,
        MaintenanceDetailComponent,
        MaintenanceUpdateComponent,
        MaintenanceDeleteDialogComponent,
        MaintenanceDeletePopupComponent
    ],
    entryComponents: [MaintenanceComponent, MaintenanceUpdateComponent, MaintenanceDeleteDialogComponent, MaintenanceDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayMaintenanceModule {}
