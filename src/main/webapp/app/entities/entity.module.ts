import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { GatewayGatewayModule } from './gateway/gateway.module';
import { GatewayEnvironmentVariablesModule } from './environment-variables/environment-variables.module';
import { GatewayFlowModule } from './flow/flow.module';
import { GatewayServiceModule } from './service/service.module';
import { GatewayHeaderModule } from './header/header.module';
import { GatewayHeaderKeysModule } from './header-keys/header-keys.module';
import { GatewayFromEndpointModule } from './from-endpoint/from-endpoint.module';
import { GatewayToEndpointModule } from './to-endpoint/to-endpoint.module';
import { GatewayErrorEndpointModule } from './error-endpoint/error-endpoint.module';
import { GatewayServiceKeysModule } from './service-keys/service-keys.module';
import { GatewayMaintenanceModule } from './maintenance/maintenance.module';
import { GatewayGroupModule } from './group/group.module';
import { GatewayWireTapEndpointModule } from './wire-tap-endpoint/wire-tap-endpoint.module';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
    imports: [
        GatewayGatewayModule,
        GatewayEnvironmentVariablesModule,
        GatewayFlowModule,
        GatewayServiceModule,
        GatewayHeaderModule,
        GatewayHeaderKeysModule,
        GatewayFromEndpointModule,
        GatewayToEndpointModule,
        GatewayErrorEndpointModule,
        GatewayServiceKeysModule,
        GatewayMaintenanceModule,
        GatewayGroupModule,
        GatewayWireTapEndpointModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
    declarations: [],
    entryComponents: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayEntityModule {}
