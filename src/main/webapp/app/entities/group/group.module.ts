import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';

import { GroupComponent } from './group.component';
import { GroupDetailComponent } from './group-detail.component';
import { GroupUpdateComponent } from './group-update.component';
import { GroupDeleteDialogComponent } from './group-delete-dialog.component';
import { groupRoute } from './group.route';

const ENTITY_STATES = [...groupRoute];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(ENTITY_STATES)],
  declarations: [GroupComponent, GroupDetailComponent, GroupUpdateComponent, GroupDeleteDialogComponent],
  entryComponents: [GroupComponent, GroupDetailComponent, GroupDeleteDialogComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GroupModule {}
