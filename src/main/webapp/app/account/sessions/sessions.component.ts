import { Component, OnInit } from '@angular/core';

import { AccountService } from 'app/core';
import { Session } from './session.model';
import { SessionsService } from './sessions.service';

@Component({
    selector: 'jhi-sessions',
    templateUrl: './sessions.component.html'
})
export class SessionsComponent implements OnInit {
    account: any;
    error: string;
    success: string;
    sessions: Session[];

    constructor(private sessionsService: SessionsService, private accountService: AccountService) {}

    ngOnInit() {
        this.sessionsService.findAll().subscribe(sessions => (this.sessions = sessions));

        this.accountService.identity().then(account => {
            this.account = account;
        });
    }

    invalidate(series) {
        this.sessionsService.delete(encodeURIComponent(series)).subscribe(response => {
            if (response.status === 200) {
                this.error = null;
                this.success = 'OK';
                this.sessionsService.findAll().subscribe(sessions => (this.sessions = sessions));
            } else {
                this.success = null;
                this.error = 'ERROR';
            }
        });
    }
}
