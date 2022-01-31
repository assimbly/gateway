import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared/shared.module';

import { GroupComponent } from './group.component';
import { GroupDetailComponent } from './group-detail.component';
import { GroupUpdateComponent } from './group-update.component';
import { GroupDeletePopupComponent } from './group-delete-dialog.component';
import { GroupDeleteDialogComponent } from './group-delete-dialog.component';
import { groupRoute } from './group.route';
import { groupPopupRoute } from './group.route';

const ENTITY_STATES = [...groupRoute, ...groupPopupRoute];

@NgModule({
    imports: [
        GatewaySharedModule,
        // GatewayAdminModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [GroupComponent, GroupUpdateComponent, GroupDetailComponent, GroupDeleteDialogComponent, GroupDeletePopupComponent],
    entryComponents: [GroupComponent, GroupUpdateComponent, GroupDetailComponent, GroupDeleteDialogComponent, GroupDeletePopupComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayGroupModule {}
