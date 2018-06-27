import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { Group } from './group.model';
import { GroupService } from './group.service';

@Component({
    selector: 'jhi-group-detail',
    templateUrl: './group-detail.component.html'
})
export class GroupDetailComponent implements OnInit, OnDestroy {

    group: Group;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private groupService: GroupService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInGroups();
    }

    load(id) {
        this.groupService.find(id).subscribe((group) => {
            this.group = group;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInGroups() {
        this.eventSubscriber = this.eventManager.subscribe(
            'groupListModification',
            (response) => this.load(this.group.id)
        );
    }
}
