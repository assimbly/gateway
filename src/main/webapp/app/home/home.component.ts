import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

import { TYPE } from 'app/app.constants';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account | null = null;
  authSubscription?: Subscription;
  type: string;

  constructor(private accountService: AccountService, private router: Router) {
    this.type = TYPE;
  }

  ngOnInit(): void {

      if (!this.isAuthenticated()) {
	  	  	console.log('login');
        this.login();
      }

    	console.log('type' + this.type);

    this.authSubscription = this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;


    });


  }

  isAuthenticated(): boolean {
    return this.accountService.isAuthenticated();
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
