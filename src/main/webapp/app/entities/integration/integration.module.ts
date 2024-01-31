import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { Components } from 'app/shared/camel/component-type';
import SharedModule from 'app/shared/shared.module';

import { IntegrationComponent } from './integration.component';
import { IntegrationService } from './integration.service';
import { IntegrationDetailComponent } from './integration-detail.component';
import { IntegrationUpdateComponent } from './integration-update.component';
import { IntegrationDeleteDialogComponent } from './integration-delete-dialog.component';
import { IntegrationImportDialogComponent } from './integration-import-dialog.component';
import { IntegrationExportDialogComponent } from './integration-export-dialog.component';
import { integrationRoute } from './integration.route';
import { IntegrationPopupService } from './integration-popup.service';

const ENTITY_STATES = [...integrationRoute];

@NgModule({
  imports: [SharedModule, PopoverModule.forRoot(), RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    IntegrationComponent,
    IntegrationDetailComponent,
    IntegrationUpdateComponent,
    IntegrationDeleteDialogComponent,
    IntegrationImportDialogComponent,
    IntegrationExportDialogComponent,
  ],
  providers: [Components, IntegrationService, IntegrationPopupService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IntegrationModule {}
