import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import SharedModule from 'app/shared/shared.module';
import { SortDirective, SortByDirective } from 'app/shared/sort';
import { TopicComponent } from './topic.component';
import { TopicDetailComponent } from './topic-detail.component';
import { TopicUpdateComponent } from './topic-update.component';
import { TopicDeleteDialogComponent } from './topic-delete-dialog.component';
import { TopicRowComponent } from './topic-row.component';
import { TopicSearchByNamePipe } from './topic.searchbyname.pipe';
import { topicRoute } from './topic.route';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopicClearDialogComponent } from 'app/entities/topic/topic-clear-dialog.component';

@NgModule({
  imports: [SharedModule, SortDirective, SortByDirective, RouterModule.forChild(topicRoute), ReactiveFormsModule, PopoverModule.forRoot()],
  declarations: [
    TopicComponent,
    TopicDetailComponent,
    TopicUpdateComponent,
    TopicDeleteDialogComponent,
    TopicSearchByNamePipe,
    TopicClearDialogComponent,
    TopicRowComponent,
    TopicClearDialogComponent,
  ],
})
export class TopicModule {}
