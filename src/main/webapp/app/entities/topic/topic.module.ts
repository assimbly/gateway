import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { SharedModule } from 'app/shared/shared.module';
import { TopicComponent } from './topic.component';
import { TopicDetailComponent } from './topic-detail.component';
import { TopicUpdateComponent } from './topic-update.component';
import { TopicDeleteDialogComponent, TopicDeletePopupComponent } from './topic-delete-dialog.component';
import { TopicRowComponent } from './topic-row.component';
import { TopicSearchByNamePipe } from './topic.searchbyname.pipe';
import { topicRoute } from './topic.route';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopicClearDialogComponent } from 'app/entities/topic/topic-clear-dialog.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(topicRoute), ReactiveFormsModule, PopoverModule.forRoot()],
  declarations: [
    TopicComponent,
    TopicDetailComponent,
    TopicUpdateComponent,
    TopicDeleteDialogComponent,
    TopicDeletePopupComponent,
    TopicSearchByNamePipe,
    TopicClearDialogComponent,
    TopicRowComponent,
    TopicClearDialogComponent,
  ],
  entryComponents: [TopicDeleteDialogComponent, TopicClearDialogComponent],
})
export class TopicModule {}
