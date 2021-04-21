import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ITopic } from 'app/shared/model/topic.model';
import { TopicService } from './topic.service';

@Component({
    templateUrl: './topic-delete-dialog.component.html'
})
export class TopicDeleteDialogComponent {
    topic?: ITopic;

    constructor(protected topicService: TopicService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmDelete(id: number): void {
        this.topicService.delete(id).subscribe(() => {
            this.eventManager.broadcast('topicListModification');
            this.activeModal.close();
        });
    }
}
