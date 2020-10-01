import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { GatewayGatewayModule } from './gateway/gateway.module';
import { GatewayEnvironmentVariablesModule } from './environment-variables/environment-variables.module';
import { GatewayServiceModule } from './service/service.module';
import { GatewayServiceKeysModule } from './service-keys/service-keys.module';
import { GatewayHeaderModule } from './header/header.module';
import { GatewayHeaderKeysModule } from './header-keys/header-keys.module';
import { GatewayFromEndpointModule } from './from-endpoint/from-endpoint.module';
import { GatewayToEndpointModule } from './to-endpoint/to-endpoint.module';
import { GatewayErrorEndpointModule } from './error-endpoint/error-endpoint.module';
import { GatewayMaintenanceModule } from './maintenance/maintenance.module';
import { GatewaySecurityModule } from './security/security.module';
import { GatewayBrokerModule } from './broker/broker.module';

import { GatewayGroupModule } from './group/group.module';
import { GatewayWireTapEndpointModule } from './wire-tap-endpoint/wire-tap-endpoint.module';
import { GatewayFlowModule } from './flow/flow.module';
import { DeploymentService } from 'app/admin';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
    // prettier-ignore
    imports: [
        GatewayGatewayModule,
        GatewayEnvironmentVariablesModule,
        GatewayFlowModule,
        GatewayServiceModule,
        GatewayServiceKeysModule,
        GatewayHeaderModule,
        GatewayHeaderKeysModule,
        GatewayFromEndpointModule,
        GatewayToEndpointModule,
        GatewayErrorEndpointModule,
        GatewayMaintenanceModule,
        GatewaySecurityModule,
        GatewayBrokerModule,
        GatewayGroupModule,
        GatewayWireTapEndpointModule
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
    exports: [
        GatewayGatewayModule,
        GatewayFlowModule,
        GatewayEnvironmentVariablesModule,
        GatewayErrorEndpointModule,
        GatewayFromEndpointModule,
        GatewayHeaderModule,
        GatewayHeaderKeysModule,
        GatewayServiceModule,
        GatewayServiceKeysModule,
        GatewayToEndpointModule,
        GatewayMaintenanceModule,
        GatewaySecurityModule,
        GatewayBrokerModule,
        GatewayGroupModule,
        GatewayWireTapEndpointModule
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
    declarations: [],
    entryComponents: [],
    providers: [DeploymentService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayEntityModule {}
