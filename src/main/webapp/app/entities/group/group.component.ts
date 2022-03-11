import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { IGroup } from 'app/shared/model/group.model';
import { GroupDeleteDialogComponent } from './group-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { GroupService } from './group.service';

@Component({
    selector: 'jhi-group',
    templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit, OnDestroy {
    groups: IGroup[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected groupService: GroupService,
        protected alertService: AlertService,
		protected modalService: NgbModal,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.groupService.query().subscribe(
            (res: HttpResponse<IGroup[]>) => {
                this.groups = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.registerChangeInGroups();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

	delete(group: IGroup): void {
		const modalRef = this.modalService.open(GroupDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.group = group;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}
	
    trackId(index: number, item: IGroup) {
        return item.id;
    }

    registerChangeInGroups() {
        this.eventSubscriber = this.eventManager.subscribe('groupListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }
}
