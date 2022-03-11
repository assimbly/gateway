import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IGroup } from 'app/shared/model/group.model';
import { GroupService } from './group.service';

@Component({
    selector: 'jhi-group-delete-dialog',
    templateUrl: './group-delete-dialog.component.html'
})
export class GroupDeleteDialogComponent {
    group: IGroup;

    constructor(protected groupService: GroupService, public activeModal: NgbActiveModal, protected eventManager: EventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.groupService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('groupListModification', 'Deleted an group'));
            this.activeModal.dismiss(true);
        });
    }
}