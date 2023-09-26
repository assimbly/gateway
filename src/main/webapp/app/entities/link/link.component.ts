import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { Observable } from 'rxjs';

import { ILink, Link } from 'app/shared/model/link.model';
import { LinkDeleteDialogComponent } from '././link-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { LinkService } from './link.service';

@Component({
    selector: 'jhi-link',
    templateUrl: './link.component.html'
})
export class LinkComponent implements OnInit, OnChanges {
    @Input() links: ILink[];
    @Input() stepId: number;

    linkKeys: Array<string> = [];
    linkSelected: boolean;
    selectedId: number;
    isSaving: boolean;
    link: ILink;
    linkId: number;
    typeHeader: string[] = ['constant', 'groovy', 'jsonpath', 'csimple', 'simple', 'spel', 'xpath'];
    eventSubscriber: Subscription;

    constructor(
        protected linkService: LinkService,
        protected alertService: AlertService,
		    protected modalService: NgbModal,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.linkService.query().subscribe(
            (res: HttpResponse<ILink[]>) => {
                this.links = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.eventManager.subscribe('linkDeleted', res => this.updateLink(parseInt(res.toString())));
    }

	delete(link: ILink): void {
		const modalRef = this.modalService.open(LinkDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.link = link;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}

    updateLink(id: number) {
        this.links = this.links.filter(x => x.id !== id);
        this.mapLinkKeys();
        if (this.links.length === 0) {
            this.addLink();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.mapLinkKeys();
    }

    save(link: ILink, i: number) {
        this.isSaving = true;
        if (link.id) {
            this.subscribeToSaveResponse(this.linkService.update(link), false, i);
        } else {
            link.stepId = this.stepId;
            this.subscribeToSaveResponse(this.linkService.create(link), true, i);
        }
    }

    private mapLinkKeys() {
        if (typeof this.link !== 'undefined') {
            this.linkKeys = this.links.map(sk => sk.name);
            this.linkKeys = this.linkKeys.filter(k => k !== undefined);
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<ILink>>, closePopup, i: number) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body, closePopup, i);
            } else {
                this.onSaveError();
            }
        });
    }

    private onSaveSuccess(result: ILink, isCreate: boolean, i: number) {
        if (isCreate) {
            this.links.splice(i, 1, result);
        } else {
            // this.links.find(k => k.id === result.id).isDisabled = true;
        }
	    this.eventManager.broadcast(new EventWithContent('linkUpdated', 'OK'));
    }

    private onSaveError() {
        this.isSaving = false;
    }

    editHeaderKey(link) {
        link.isDisabled = false;
    }

    cloneHeaderKey(link: ILink) {
        const linkForClone = new Link(link.stepId, link.name, link.bound, link.transport, link.rule);
        this.links.push(linkForClone);
    }

    addLink() {
        const newLink = new Link();
        this.links.push(newLink);
        this.mapLinkKeys();
    }

    removeLink(i: number) {
        this.links.splice(i, 1);
        this.mapLinkKeys();
        if (this.links.length === 0) {
            this.addLink();
        }
    }

    trackId(index: number, item: ILink) {
        return item.id;
    }

    registerChangeInLink() {
        this.eventSubscriber = this.eventManager.subscribe('linkListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }
}
