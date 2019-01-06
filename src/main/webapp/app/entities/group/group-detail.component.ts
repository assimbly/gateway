import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IGroup } from 'app/shared/model/group.model';

@Component({
    selector: 'jhi-group-detail',
    templateUrl: './group-detail.component.html'
})
export class GroupDetailComponent implements OnInit {
    group: IGroup;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ group }) => {
            this.group = group;
        });
    }

    previousState() {
        window.history.back();
    }
}
