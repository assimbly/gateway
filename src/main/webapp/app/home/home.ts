import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AccountService } from 'app/core/auth';
import { TranslateDirective } from 'app/shared/language';
import { environment } from 'environments/environment';

import Login from 'app/login/login';
import { FlowComponent } from 'app/path/to/flow.component'; // Adjust import paths
import { BrokerComponent } from 'app/path/to/broker.component';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [TranslateDirective, RouterLink, Login, FlowComponent, BrokerComponent],
})
export default class Home {
  public readonly TYPE = environment.TYPE;
  public readonly account = inject(AccountService).account;
  private readonly router = inject(Router);

  login(): void {
    this.router.navigate(['/login']);
  }
}
