import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
import {
    MaintenanceService,
    MaintenancePopupService,
    MaintenanceComponent,
    MaintenanceDetailComponent,
    MaintenanceDialogComponent,
    MaintenancePopupComponent,
    MaintenanceDeletePopupComponent,
    MaintenanceDeleteDialogComponent,
    maintenanceRoute,
    maintenancePopupRoute,
} from './';

const ENTITY_STATES = [
    ...maintenanceRoute,
    ...maintenancePopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        MaintenanceComponent,
        MaintenanceDetailComponent,
        MaintenanceDialogComponent,
        MaintenanceDeleteDialogComponent,
        MaintenancePopupComponent,
        MaintenanceDeletePopupComponent,
    ],
    entryComponents: [
        MaintenanceComponent,
        MaintenanceDialogComponent,
        MaintenancePopupComponent,
        MaintenanceDeleteDialogComponent,
        MaintenanceDeletePopupComponent,
    ],
    providers: [
        MaintenanceService,
        MaintenancePopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayMaintenanceModule {}
