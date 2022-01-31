import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GatewaySharedLibsModule } from './shared-libs.module';
import { FindLanguageFromKeyPipe } from './language/find-language-from-key.pipe';
import { AlertComponent } from './alert/alert.component';
import { AlertErrorComponent } from './alert/alert-error.component';
import { LoginModalComponent } from './login/login.component';
import { HasAnyAuthorityDirective } from './auth/has-any-authority.directive';

import { WindowRef } from '../../app/shared/auth/window.service';
import { CSRFService } from '../../app/core/auth/csrf.service';
import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateMomentAdapter } from './util/datepicker-adapter';

@NgModule({
  imports: [GatewaySharedLibsModule],
  declarations: [FindLanguageFromKeyPipe, AlertComponent, AlertErrorComponent, LoginModalComponent, HasAnyAuthorityDirective],
  providers: [WindowRef, CSRFService, { provide: NgbDateAdapter, useClass: NgbDateMomentAdapter }],
  entryComponents: [LoginModalComponent],
  exports: [
    GatewaySharedLibsModule,
    FindLanguageFromKeyPipe,
    AlertComponent,
    AlertErrorComponent,
    LoginModalComponent,
    HasAnyAuthorityDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewaySharedModule {}
