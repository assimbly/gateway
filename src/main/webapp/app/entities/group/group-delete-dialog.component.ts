import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Group } from './group.model';
import { GroupPopupService } from './group-popup.service';
import { GroupService } from './group.service';

@Component({
    selector: 'jhi-group-delete-dialog',
    templateUrl: './group-delete-dialog.component.html'
})
export class GroupDeleteDialogComponent {

    group: Group;

    constructor(
        private groupService: GroupService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.groupService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'groupListModification',
                content: 'Deleted an group'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-group-delete-popup',
    template: ''
})
export class GroupDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private groupPopupService: GroupPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.groupPopupService
                .open(GroupDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
