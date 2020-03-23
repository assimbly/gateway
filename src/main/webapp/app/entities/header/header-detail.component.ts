import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from './header.service';
import { IHeader } from 'app/shared/model/header.model';
import { HeaderKeysService } from '../header-keys/header-keys.service';
import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

@Component({
    selector: 'jhi-header-detail',
    templateUrl: './header-detail.component.html'
})
export class HeaderDetailComponent implements OnInit {
    header: IHeader;

    constructor(
        protected eventManager: JhiEventManager,
        protected activatedRoute: ActivatedRoute,
        protected headerService: HeaderService,
        protected headerKeysService: HeaderKeysService
    ) {}
    public headerKeys: Array<HeaderKeys>;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ header }) => {
            this.header = header;
        });
    }

    private load(id) {
        this.headerService.find(id).subscribe(header => {
            this.header = header.body;
            this.loadHeaderKeys(this.header.id);
        });
    }

    private loadHeaderKeys(id: number) {
        this.headerKeysService.query().subscribe(res => {
            this.headerKeys = res.body.filter(hk => hk.headerId === id);
        });
    }

    previousState() {
        window.history.back();
    }
}
