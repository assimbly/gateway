import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IGroup } from 'app/shared/model/group.model';
import { GroupService } from './group.service';

@Component({
    selector: 'jhi-group-delete-dialog',
    templateUrl: './group-delete-dialog.component.html'
})
export class GroupDeleteDialogComponent {
    group: IGroup;

    constructor(protected groupService: GroupService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.groupService.delete(id).subscribe(response => {
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
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ group }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(GroupDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.group = group;
                this.ngbModalRef.result.then(
                    result => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    },
                    reason => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    }
                );
            }, 0);
        });
    }

    ngOnDestroy() {
        this.ngbModalRef = null;
    }
}
