import { NgModule } from '@angular/core';

import { GatewaySharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent } from './';

@NgModule({
    imports: [GatewaySharedLibsModule],
    declarations: [JhiAlertComponent, JhiAlertErrorComponent],
    exports: [GatewaySharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent]
})
export class GatewaySharedCommonModule {}
