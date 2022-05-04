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
    	  	console.log('1');


      if (!this.isAuthenticated()) {
	  	  	console.log('login');
        this.login();
      }
			
    	console.log('type' + this.type);
  
		/*
		if(this.type === 'FULL'){
			console.log('type2' + this.type);

			this.router.navigate(['/flow']);
		}
		*/
			
    this.authSubscription = this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;

	  
	  

    });
	
	console.log('2');
	
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