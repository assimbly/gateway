import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HeaderService } from './header.service';
import { HeaderKeysService } from '../header-keys/header-keys.service';
import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';

import { Header } from 'app/shared/model/header.model';
import { Subscription } from "rxjs";
import { JhiEventManager } from "ng-jhipster";

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
    ) {}
  
    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInHeaders();
    }

    registerChangeInHeaders() {
        this.eventSubscriber = this.eventManager.subscribe(
            'flowListModification',
            (response) => this.load(this.header.id)
        );
    }
    
    private load(id) {
        this.headerService.find(id).subscribe((header) => {
            this.header = header.body;
            this.loadHeaderKeys(this.header.id);
        });
    }

    private loadHeaderKeys(id: number) {
        this.headerKeysService.query().subscribe((res) => {
            this.headerKeys = res.body.filter((hk) => hk.headerId === id);
        });
    }
}    
