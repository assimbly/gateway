import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlowService } from '../flow';
import { CommonModule } from '@angular/common';

import { GatewaySharedModule } from 'app/shared';
import {
    MaintenanceComponent,
    MaintenanceUpdateComponent,
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
        MaintenanceUpdateComponent,
        MaintenanceDeleteDialogComponent,
        MaintenanceDeletePopupComponent,
        MaintenanceDetailComponent
    ],
    entryComponents: [
        MaintenanceComponent,
        MaintenanceUpdateComponent,
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
