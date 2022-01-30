import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { GatewaySharedModule } from 'app/shared/shared.module';
import { TopicComponent } from './topic.component';
import { TopicDetailComponent } from './topic-detail.component';
import { TopicUpdateComponent } from './topic-update.component';
import { TopicDeleteDialogComponent, TopicDeletePopupComponent } from './topic-delete-dialog.component';
import { TopicRowComponent } from './topic-row.component';
import { TopicSearchByNamePipe } from './topic.searchbyname.pipe';
import { TopicClearDialogComponent } from 'app/entities/topic/topic-clear-dialog.component';

import { topicRoute } from './topic.route';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(topicRoute), ReactiveFormsModule, PopoverModule.forRoot()],
    declarations: [
        TopicComponent,
        TopicDetailComponent,
        TopicUpdateComponent,
        TopicDeleteDialogComponent,
        TopicDeletePopupComponent,
        TopicSearchByNamePipe,
        TopicRowComponent,
        TopicClearDialogComponent
    ],
    entryComponents: [TopicDeleteDialogComponent, TopicClearDialogComponent]
})
export class GatewayTopicModule {}
