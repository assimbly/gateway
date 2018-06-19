import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaintenanceComponent } from './maintenance.component';
import { maintenanceRoute } from './maintenance.route'
import { RouterModule } from '@angular/router';
import { FlowService } from '../flow';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule.forChild(maintenanceRoute)
    ],
    declarations: [
        MaintenanceComponent
    ],
    entryComponents: [
        MaintenanceComponent
    ],
    providers: [
        FlowService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayMaintenanceModule { }
