import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from 'app/core/auth';
import { environment } from 'environments/environment';

import Login from 'app/login/login';
import { FlowComponent } from 'app/entities/flow/flow.component';
//import { BrokerComponent } from 'app/entities/broker/broker.component';


@Component({
  selector: 'jhi-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [Login, FlowComponent],
})
export default class Home {
  public readonly TYPE = environment.TYPE;
  public readonly account = inject(AccountService).account;
  private readonly router = inject(Router);

  login(): void {
    this.router.navigate(['/login']);
  }
}
