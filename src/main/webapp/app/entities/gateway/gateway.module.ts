import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { Components } from 'app/shared/camel/component-type';
import { SharedModule } from 'app/shared/shared.module';

import { GatewayComponent } from './gateway.component';
import { GatewayService } from './gateway.service';
import { GatewayDetailComponent } from './gateway-detail.component';
import { GatewayUpdateComponent } from './gateway-update.component';
import { GatewayDeletePopupComponent } from './gateway-delete-dialog.component';
import { GatewayDeleteDialogComponent } from './gateway-delete-dialog.component';
import { GatewayImportPopupComponent } from './gateway-import-dialog.component';
import { GatewayImportDialogComponent } from './gateway-import-dialog.component';
import { GatewayExportPopupComponent } from './gateway-export-dialog.component';
import { GatewayExportDialogComponent } from './gateway-export-dialog.component';
import { gatewayRoute } from './gateway.route';
import { gatewayPopupRoute } from './gateway.route';
import { GatewayPopupService } from './gateway-popup.service';

const ENTITY_STATES = [...gatewayRoute, ...gatewayPopupRoute];

@NgModule({
  imports: [SharedModule, PopoverModule.forRoot(), RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    GatewayComponent,
    GatewayDetailComponent,
    GatewayUpdateComponent,
    GatewayDeleteDialogComponent,
    GatewayDeletePopupComponent,
    GatewayImportPopupComponent,
    GatewayImportDialogComponent,
    GatewayExportPopupComponent,
    GatewayExportDialogComponent,
  ],
  entryComponents: [
    GatewayComponent,
    GatewayUpdateComponent,
    GatewayDeleteDialogComponent,
    GatewayDeletePopupComponent,
    GatewayImportPopupComponent,
    GatewayImportDialogComponent,
    GatewayExportPopupComponent,
    GatewayExportDialogComponent,
  ],
  providers: [Components, GatewayService, GatewayPopupService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GatewayGatewayModule {}
