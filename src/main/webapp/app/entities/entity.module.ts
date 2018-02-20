import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { GatewayGatewayModule } from './gateway/gateway.module';
import { GatewayEnvironmentVariablesModule } from './environment-variables/environment-variables.module';
import { GatewayCamelRouteModule } from './camel-route/camel-route.module';
import { GatewayServiceModule } from './service/service.module';
import { GatewayHeaderModule } from './header/header.module';
import { GatewayHeaderKeysModule } from './header-keys/header-keys.module';
import { GatewayFromEndpointModule } from './from-endpoint/from-endpoint.module';
import { GatewayToEndpointModule } from './to-endpoint/to-endpoint.module';
import { GatewayErrorEndpointModule } from './error-endpoint/error-endpoint.module';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
    imports: [
        GatewayGatewayModule,
        GatewayEnvironmentVariablesModule,
        GatewayCamelRouteModule,
        GatewayServiceModule,
        GatewayHeaderModule,
        GatewayHeaderKeysModule,
        GatewayFromEndpointModule,
        GatewayToEndpointModule,
        GatewayErrorEndpointModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
    exports: [
        GatewayCamelRouteModule,
        GatewayEnvironmentVariablesModule,
        GatewayErrorEndpointModule,
        GatewayFromEndpointModule,
        GatewayGatewayModule,
        GatewayHeaderModule,
        GatewayHeaderKeysModule,
        GatewayToEndpointModule,
        GatewayServiceModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
    declarations: [],
    entryComponents: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayEntityModule {}
