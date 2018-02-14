import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { GatewaySharedModule } from '../../shared';
import { GatewayFromEndpointModule } from '../../entities/from-endpoint/from-endpoint.module';
import { GatewayToEndpointModule } from '../../entities/to-endpoint/to-endpoint.module';
import { GatewayErrorEndpointModule } from '../../entities/error-endpoint/error-endpoint.module';

import {
    CamelRouteService,
    CamelRoutePopupService,
    CamelRouteComponent,
    CamelRouteConfigurationComponent,
    CamelRouteDetailComponent,
    CamelRouteEditAllComponent,
    CamelRouteDialogComponent,
    CamelRoutePopupComponent,
    CamelRouteDeletePopupComponent,
    CamelRouteDeleteDialogComponent,
    camelRouteRoute,
    camelRoutePopupRoute,
} from './';

const ENTITY_STATES = [
    ...camelRouteRoute,
    ...camelRoutePopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        GatewayFromEndpointModule,
        GatewayToEndpointModule,
        GatewayErrorEndpointModule,
        RouterModule.forChild(ENTITY_STATES),
        NgbModule
    ],
    exports: [
        CamelRouteComponent
    ],
    declarations: [
        CamelRouteComponent,
        CamelRouteConfigurationComponent,
        CamelRouteDetailComponent,
        CamelRouteEditAllComponent,
        CamelRouteDialogComponent,
        CamelRouteDeleteDialogComponent,
        CamelRoutePopupComponent,
        CamelRouteDeletePopupComponent,
    ],
    entryComponents: [
        CamelRouteComponent,
        CamelRouteConfigurationComponent,
        CamelRouteEditAllComponent,
        CamelRouteDialogComponent,
        CamelRoutePopupComponent,
        CamelRouteDeleteDialogComponent,
        CamelRouteDeletePopupComponent,
    ],
    providers: [
        CamelRouteService,
        CamelRoutePopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayCamelRouteModule {}
