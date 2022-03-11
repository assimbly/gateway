import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlowService } from 'app/entities/flow/flow.service';
import { SharedModule } from 'app/shared/shared.module';

import { MaintenanceService } from './maintenance.service';
import { MaintenanceComponent } from './maintenance.component';
import { MaintenanceDetailComponent } from './maintenance-detail.component';

import { MaintenanceUpdateComponent } from './maintenance-update.component';
import { MaintenanceDeleteDialogComponent } from './maintenance-delete-dialog.component';

import { maintenanceRoute } from './maintenance.route';

const ENTITY_STATES = [...maintenanceRoute];

@NgModule({
  imports: [SharedModule, ReactiveFormsModule, CommonModule, RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    MaintenanceComponent,
    MaintenanceDetailComponent,
    MaintenanceUpdateComponent,
    MaintenanceDeleteDialogComponent,
  ],
  entryComponents: [MaintenanceComponent, MaintenanceUpdateComponent, MaintenanceDeleteDialogComponent],
  providers: [MaintenanceService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MaintenanceModule {}
