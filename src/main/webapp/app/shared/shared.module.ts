import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';

import { NgbDateMomentAdapter } from './util/datepicker-adapter';
import { GatewaySharedLibsModule, GatewaySharedCommonModule, JhiLoginModalComponent, HasAnyAuthorityDirective } from './';
import { WindowRef } from '../../app/shared/auth/window.service';
import { CSRFService } from '../../app/core';

@NgModule({
    imports: [GatewaySharedLibsModule, GatewaySharedCommonModule],
    declarations: [JhiLoginModalComponent, HasAnyAuthorityDirective],
    providers: [WindowRef, CSRFService, { provide: NgbDateAdapter, useClass: NgbDateMomentAdapter }],
    entryComponents: [JhiLoginModalComponent],
    exports: [GatewaySharedCommonModule, JhiLoginModalComponent, HasAnyAuthorityDirective],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewaySharedModule {
    static forRoot() {
        return {
            ngModule: GatewaySharedModule
        };
    }
}
