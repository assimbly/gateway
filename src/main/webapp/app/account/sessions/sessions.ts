import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { EMPTY, catchError, concatMap, tap } from 'rxjs';

import { Account, AccountService } from 'app/core/auth';
import { TranslateDirective } from 'app/shared/language';

import { Session } from './session.model';
import { SessionsService } from './sessions.service';

@Component({
  selector: 'jhi-sessions',
  imports: [DatePipe, TranslateDirective],
  templateUrl: './sessions.html',
})
export default class Sessions implements OnInit {
  account: Account | null = null;
  error = false;
  success = false;
  sessions: Session[] = [];

  private readonly sessionsService = inject(SessionsService);
  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    this.sessionsService.findAll().subscribe(sessions => (this.sessions = sessions));

    this.accountService.identity().subscribe(account => (this.account = account));
  }

  invalidate(series: string): void {
    this.error = false;
    this.success = false;

    this.sessionsService
      .delete(encodeURIComponent(series))
      .pipe(
        tap(() => (this.success = true)),
        // only a failed delete is reported; reading the list again happens after it
        catchError(() => {
          this.error = true;
          return EMPTY;
        }),
        concatMap(() => this.sessionsService.findAll()),
      )
      .subscribe(sessions => (this.sessions = sessions));
  }
}
