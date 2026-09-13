import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { DataUtils } from 'app/core/util/data-util.service';

import { IRoute } from 'app/shared/model/route.model';

@Component({
    selector: 'jhi-route-detail',
    templateUrl: './route-detail.component.html',
    imports: [CommonModule, RouterModule, FontAwesomeModule, AlertError],
})
export class RouteDetailComponent implements OnInit {
    route: IRoute | null = null;

    constructor(protected dataUtils: DataUtils, protected activatedRoute: ActivatedRoute) {}

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ route }) => (this.route = route));
    }

    byteSize(base64String: string): string {
        return this.dataUtils.byteSize(base64String);
    }

    openFile(contentType: string, base64String: string): void {
        this.dataUtils.openFile(contentType, base64String);
    }

    previousState(): void {
        window.history.back();
    }
}
