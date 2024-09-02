import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import SharedModule from 'app/shared/shared.module';
import { SortDirective, SortByDirective } from 'app/shared/sort';
import { QueueComponent } from './queue.component';
import { QueueDetailComponent } from './queue-detail.component';
import { QueueUpdateComponent } from './queue-update.component';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';
import { QueueRowComponent } from './queue-row.component';
import { queueRoute } from './queue.route';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueueSearchByNamePipe } from './queue.searchbyname.pipe';
import { QueueClearDialogComponent } from 'app/entities/queue/queue-clear-dialog.component';

@NgModule({
  imports: [SharedModule, SortDirective, SortByDirective, RouterModule.forChild(queueRoute), ReactiveFormsModule, PopoverModule.forRoot()],
  declarations: [
    QueueComponent,
    QueueDetailComponent,
    QueueUpdateComponent,
    QueueDeleteDialogComponent,
    QueueSearchByNamePipe,
    QueueRowComponent,
    QueueClearDialogComponent,
  ],
})
export class QueueModule {}
