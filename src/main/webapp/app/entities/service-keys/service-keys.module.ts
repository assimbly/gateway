import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Services } from 'app/shared/camel/service-connections';
import { GatewaySharedModule } from 'app/shared/shared.module';
import {
    ServiceKeysComponent,
    ServiceKeysDetailComponent,
    ServiceKeysUpdateComponent,
    ServiceKeysDeletePopupComponent,
    ServiceKeysDeleteDialogComponent,
    serviceKeysRoute,
    serviceKeysPopupRoute,
    ForbiddenServiceKeysValidatorDirective
} from './';

const ENTITY_STATES = [...serviceKeysRoute, ...serviceKeysPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    exports: [ServiceKeysComponent],
    declarations: [
        ServiceKeysComponent,
        ServiceKeysDetailComponent,
        ServiceKeysUpdateComponent,
        ServiceKeysDeleteDialogComponent,
        ServiceKeysDeletePopupComponent,
        ForbiddenServiceKeysValidatorDirective
    ],
    entryComponents: [ServiceKeysComponent, ServiceKeysUpdateComponent, ServiceKeysDeleteDialogComponent, ServiceKeysDeletePopupComponent],
    providers: [ServiceKeysDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayServiceKeysModule {}
