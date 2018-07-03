import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlowService } from '../flow';
import { CommonModule } from '@angular/common';

import {
    MaintenanceService,
    MaintenancePopupService,
    MaintenanceComponent,
    MaintenanceDialogComponent,
    MaintenancePopupComponent,
    MaintenanceDeleteDialogComponent,
    MaintenanceDeletePopupComponent,
    MaintenanceDetailComponent,
    maintenanceRoute
} from './';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule.forChild(maintenanceRoute)
    ],
    declarations: [
        MaintenanceComponent,
        MaintenanceDialogComponent,
        MaintenancePopupComponent,
        MaintenancePopupComponent,
        MaintenanceDeleteDialogComponent,
        MaintenanceDeletePopupComponent,
        MaintenanceDetailComponent
    ],
    entryComponents: [
        MaintenanceComponent,
        MaintenanceDialogComponent,
        MaintenancePopupComponent,
        MaintenancePopupComponent,
        MaintenanceDeleteDialogComponent,
        MaintenanceDeletePopupComponent,
        MaintenanceDetailComponent

    ],
    providers: [
        FlowService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayMaintenanceModule { }
