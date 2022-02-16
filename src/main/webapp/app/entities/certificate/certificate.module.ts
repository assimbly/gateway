import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'app/shared/shared.module';

import { CertificateComponent } from './certificate.component';
import { CertificateDetailComponent } from './certificate-detail.component';
import { CertificateUpdateComponent } from './certificate-update.component';

import { CertificateDeletePopupComponent } from './certificate-delete-dialog.component';
import { CertificateDeleteDialogComponent } from './certificate-delete-dialog.component';

import { CertificateUploadPopupComponent } from './certificate-upload-dialog.component';
import { CertificateUploadDialogComponent } from './certificate-upload-dialog.component';

import { CertificateUploadP12PopupComponent } from './certificate-uploadp12-dialog.component';
import { CertificateUploadP12DialogComponent } from './certificate-uploadp12-dialog.component';

import { CertificatePopupService } from './certificate-popup.service';

import { CertificateSelfSignPopupComponent } from './certificate-self-sign-dialog.component';
import { CertificateSelfSignDialogComponent } from './certificate-self-sign-dialog.component';

import { certificateRoute } from './certificate.route';
import { certificatePopupRoute } from './certificate.route';

const ENTITY_STATES = [...certificateRoute, ...certificatePopupRoute];

@NgModule({
  imports: [SharedModule, FormsModule, ReactiveFormsModule, PopoverModule.forRoot(), RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    CertificateComponent,
    CertificateDetailComponent,
    CertificateUpdateComponent,
    CertificateDeleteDialogComponent,
    CertificateDeletePopupComponent,
    CertificateUploadPopupComponent,
    CertificateUploadDialogComponent,
    CertificateUploadP12PopupComponent,
    CertificateUploadP12DialogComponent,
    CertificateSelfSignPopupComponent,
    CertificateSelfSignDialogComponent,
  ],
  entryComponents: [
    CertificateComponent,
    CertificateUpdateComponent,
    CertificateDeleteDialogComponent,
    CertificateDeletePopupComponent,
    CertificateUploadPopupComponent,
    CertificateUploadDialogComponent,
    CertificateUploadP12PopupComponent,
    CertificateUploadP12DialogComponent,
    CertificateSelfSignPopupComponent,
    CertificateSelfSignDialogComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CertificateModule {}
