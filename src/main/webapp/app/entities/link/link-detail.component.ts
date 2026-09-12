import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ILink } from 'app/shared/model/link.model';

@Component({
    selector: 'jhi-link-detail',
    templateUrl: './link-detail.component.html'
})
export class LinkDetailComponent implements OnInit {
    link: ILink;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ link }) => {
            this.link = link;
        });
    }

    previousState() {
        window.history.back();
    }
}
