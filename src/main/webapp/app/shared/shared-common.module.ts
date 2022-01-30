import { NgModule } from '@angular/core';

import { GatewaySharedLibsModule, AlertComponent, AlertErrorComponent } from './';

@NgModule({
    imports: [GatewaySharedLibsModule],
    declarations: [AlertComponent, AlertErrorComponent],
    exports: [GatewaySharedLibsModule, AlertComponent, AlertErrorComponent]
})
export class GatewaySharedCommonModule {}
