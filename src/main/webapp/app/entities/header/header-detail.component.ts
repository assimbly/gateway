import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IHeader } from 'app/shared/model/header.model';

@Component({
    selector: 'jhi-header-detail',
    templateUrl: './header-detail.component.html',
    imports: [CommonModule, RouterModule, FontAwesomeModule, AlertError],
})
export class HeaderDetailComponent implements OnInit {
    header: IHeader;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ header }) => {
            this.header = header;
        });
    }

    previousState() {
        window.history.back();
    }
}
