import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared/shared.module';
import { QueueComponent } from './queue.component';
import { QueueDetailComponent } from './queue-detail.component';
import { QueueUpdateComponent } from './queue-update.component';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';
import { QueueRowComponent } from './queue-row.component';
import { queueRoute } from './queue.route';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueueSearchByNamePipe } from './queue.searchbyname.pipe';

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(queueRoute), ReactiveFormsModule],
    declarations: [
        QueueComponent,
        QueueDetailComponent,
        QueueUpdateComponent,
        QueueDeleteDialogComponent,
        QueueSearchByNamePipe,
        QueueRowComponent
    ],
    entryComponents: [QueueDeleteDialogComponent]
})
export class GatewayQueueModule {}
