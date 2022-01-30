import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';

import { NgbDateMomentAdapter } from './util/datepicker-adapter';
import { GatewaySharedLibsModule, GatewaySharedCommonModule, LoginModalComponent, HasAnyAuthorityDirective } from './';
import { WindowRef } from '../../app/shared/auth/window.service';
import { CSRFService } from '../../app/core';

@NgModule({
    imports: [GatewaySharedLibsModule, GatewaySharedCommonModule],
    declarations: [LoginModalComponent, HasAnyAuthorityDirective],
    providers: [WindowRef, CSRFService, { provide: NgbDateAdapter, useClass: NgbDateMomentAdapter }],
    entryComponents: [LoginModalComponent],
    exports: [GatewaySharedCommonModule, LoginModalComponent, HasAnyAuthorityDirective],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewaySharedModule {
    static forRoot() {
        return {
            ngModule: GatewaySharedModule
        };
    }
}
