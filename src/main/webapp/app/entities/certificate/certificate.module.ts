import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import SharedModule from 'app/shared/shared.module';
import { SortDirective, SortByDirective } from 'app/shared/sort';

import { CertificateComponent } from './certificate.component';
import { CertificateDetailComponent } from './certificate-detail.component';
import { CertificateUpdateComponent } from './certificate-update.component';

import { CertificateDeleteDialogComponent } from './certificate-delete-dialog.component';
import { CertificateUploadDialogComponent } from './certificate-upload-dialog.component';
import { CertificateUploadP12DialogComponent } from './certificate-uploadp12-dialog.component';
import { CertificateSelfSignDialogComponent } from './certificate-self-sign-dialog.component';

import { certificateRoute } from './certificate.route';

import { CertificatePopupService } from './certificate-popup.service';


const ENTITY_STATES = [...certificateRoute];

@NgModule({
  imports: [SharedModule, SortDirective, SortByDirective, FormsModule, ReactiveFormsModule, PopoverModule.forRoot(), RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    CertificateComponent,
    CertificateDetailComponent,
    CertificateUpdateComponent,
    CertificateDeleteDialogComponent,
    CertificateUploadDialogComponent,
    CertificateUploadP12DialogComponent,
    CertificateSelfSignDialogComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CertificateModule {}
