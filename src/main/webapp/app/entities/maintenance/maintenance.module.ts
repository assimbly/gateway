import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlowService } from 'app/entities/flow';
import { GatewaySharedModule } from 'app/shared/shared.module';
import {
    MaintenanceService,
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
