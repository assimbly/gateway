import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlowService } from 'app/entities/flow/flow.service';
import { GatewaySharedModule } from 'app/shared/shared.module';

import { MaintenanceService } from './maintenance.service';
import { MaintenanceComponent } from './maintenance.component';
import { MaintenanceDetailComponent } from './maintenance-detail.component';

import { MaintenanceUpdateComponent } from './maintenance-update.component';
import { MaintenanceDeleteDialogComponent } from './maintenance-delete-dialog.component';
import { MaintenanceDeletePopupComponent } from './maintenance-delete-dialog.component';

import { maintenanceRoute } from './maintenance.route';
import { maintenancePopupRoute } from './maintenance.route';

const ENTITY_STATES = [...maintenanceRoute, ...maintenancePopupRoute];

@NgModule({
    imports: [GatewaySharedModule, ReactiveFormsModule, CommonModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        MaintenanceComponent,
        MaintenanceDetailComponent,
        MaintenanceUpdateComponent,
        MaintenanceDeleteDialogComponent,
        MaintenanceDeletePopupComponent
    ],
    entryComponents: [MaintenanceComponent, MaintenanceUpdateComponent, MaintenanceDeleteDialogComponent, MaintenanceDeletePopupComponent],
    providers: [MaintenanceService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayMaintenanceModule {}
