import { AfterViewInit, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';

import { AccountService } from 'app/core/auth';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { LoginService } from 'app/login/login.service';
import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-login',
  standalone: true,
  imports: [TranslateDirective, TranslatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export default class Login implements OnInit, AfterViewInit {
  readonly username = viewChild.required<ElementRef>('username');

  readonly authenticationError = signal(false);
  /** Whether the Gateway lets anyone create an account; otherwise an administrator adds users. */
  readonly registration = toSignal(
    inject(ProfileService)
      .getProfileInfo()
      .pipe(map(info => info.registration === true)),
    { initialValue: false },
  );

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl(false, { nonNullable: true, validators: [Validators.required] }),
  });

  private readonly accountService = inject(AccountService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // if already authenticated then navigate to home page
    this.accountService.identity().subscribe(() => {
      if (this.accountService.isAuthenticated()) {
        this.router.navigate(['']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.username().nativeElement.focus();
  }

  login(): void {
    this.loginService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.authenticationError.set(false);
        if (!this.router.currentNavigation()) {
          // There were no routing during login (eg from navigationToStoredUrl)
          this.router.navigate(['']);
        }
      },
      error: () => this.authenticationError.set(true),
    });
  }
}
