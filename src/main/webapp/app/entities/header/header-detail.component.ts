import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HeaderService } from './header.service';
import { HeaderKeysService } from '../header-keys/header-keys.service';
import { HeaderKeys } from '../header-keys';
import { Header } from 'app/shared/model/header.model';

@Component({
    selector: 'jhi-header-detail',
    templateUrl: './header-detail.component.html'
})
export class HeaderDetailComponent implements OnInit {

    public header: Header;
    public headerKeys: Array<HeaderKeys>;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private headerService: HeaderService,
        private headerKeysService: HeaderKeysService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInHeaders();
    }

    private load(id) {
        this.headerService.find(id).subscribe((header) => {
            this.header = header;
            this.loadHeaderKeys(this.header.id);
        });
    }

    private loadHeaderKeys(id: number) {
        this.headerKeysService.query().subscribe((res) => {
            this.headerKeys = res.json.filter((hk) => hk.headerId === id);
        });

}
