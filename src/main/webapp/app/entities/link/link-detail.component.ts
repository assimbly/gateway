import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { ILink } from 'app/shared/model/link.model';

@Component({
    selector: 'jhi-link-detail',
    templateUrl: './link-detail.component.html',
    imports: [CommonModule, RouterModule, FontAwesomeModule, AlertError],
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
