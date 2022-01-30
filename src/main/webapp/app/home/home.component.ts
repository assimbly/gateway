import { Component, OnInit } from '@angular/core';
import { JhiEventManager } from 'ng-jhipster';
import { TYPE } from 'app/app.constants';

import { LoginModalService, AccountService, Account } from 'app/core';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: ['home.scss']
})
export class HomeComponent implements OnInit {
    account: Account;
    type: string;

    constructor(
        private accountService: AccountService,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager
    ) {
        this.type = TYPE;
    }

    ngOnInit() {
        this.accountService.identity().subscribe(account => {
            this.account = account;

            if (!this.isAuthenticated()) {
                this.login();
            }
        });
        this.registerAuthenticationSuccess();
    }

    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', message => {
            this.accountService.identity().subscribe(account => {
                this.account = account;
            });
        });
    }

    isAuthenticated() {
        return this.accountService.isAuthenticated();
    }

    login() {
        this.loginModalService.open();
    }
}
