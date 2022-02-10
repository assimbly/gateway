import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'app/shared/shared.module';

import { SecurityComponent } from './security.component';
import { SecurityDetailComponent } from './security-detail.component';
import { SecurityUpdateComponent } from './security-update.component';

import { SecurityDeletePopupComponent } from './security-delete-dialog.component';
import { SecurityDeleteDialogComponent } from './security-delete-dialog.component';

import { SecurityUploadPopupComponent } from './security-upload-dialog.component';
import { SecurityUploadDialogComponent } from './security-upload-dialog.component';

import { SecurityUploadP12PopupComponent } from './security-uploadp12-dialog.component';
import { SecurityUploadP12DialogComponent } from './security-uploadp12-dialog.component';

import { SecurityPopupService } from './security-popup.service';

import { SecuritySelfSignPopupComponent } from './security-self-sign-dialog.component';
import { SecuritySelfSignDialogComponent } from './security-self-sign-dialog.component';

import { securityRoute } from './security.route';
import { securityPopupRoute } from './security.route';

const ENTITY_STATES = [...securityRoute, ...securityPopupRoute];

@NgModule({
  imports: [SharedModule, FormsModule, ReactiveFormsModule, PopoverModule.forRoot(), RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    SecurityComponent,
    SecurityDetailComponent,
    SecurityUpdateComponent,
    SecurityDeleteDialogComponent,
    SecurityDeletePopupComponent,
    SecurityUploadPopupComponent,
    SecurityUploadDialogComponent,
    SecurityUploadP12PopupComponent,
    SecurityUploadP12DialogComponent,
    SecuritySelfSignPopupComponent,
    SecuritySelfSignDialogComponent,
  ],
  entryComponents: [
    SecurityComponent,
    SecurityUpdateComponent,
    SecurityDeleteDialogComponent,
    SecurityDeletePopupComponent,
    SecurityUploadPopupComponent,
    SecurityUploadDialogComponent,
    SecurityUploadP12PopupComponent,
    SecurityUploadP12DialogComponent,
    SecuritySelfSignPopupComponent,
    SecuritySelfSignDialogComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GatewaySecurityModule {}
