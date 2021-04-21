import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared/shared.module';
import { QueueComponent } from './queue.component';
import { QueueDetailComponent } from './queue-detail.component';
import { QueueUpdateComponent } from './queue-update.component';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';
import { queueRoute } from './queue.route';

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(queueRoute)],
    declarations: [QueueComponent, QueueDetailComponent, QueueUpdateComponent, QueueDeleteDialogComponent],
    entryComponents: [QueueDeleteDialogComponent]
})
export class GatewayQueueModule {}
