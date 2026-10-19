import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth';
import { TranslateDirective } from 'app/shared/language';

import PasswordStrengthBar from './password-strength-bar/password-strength-bar';
import { PasswordService } from './password.service';

@Component({
  selector: 'jhi-password',
  imports: [TranslateDirective, TranslatePipe, ReactiveFormsModule, PasswordStrengthBar],
  templateUrl: './password.html',
})
export default class Password {
  readonly doNotMatch = signal(false);
  readonly error = signal(false);
  readonly success = signal(false);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  readonly account = this.accountService.account;
  /** The user still has a default password: they can't do anything else until they choose a new one. */
  readonly changeRequired = computed(() => this.account()?.passwordChangeRequired === true);
  passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
  });

  private readonly passwordService = inject(PasswordService);

  changePassword(): void {
    this.error.set(false);
    this.success.set(false);
    this.doNotMatch.set(false);

    const { newPassword, confirmPassword, currentPassword } = this.passwordForm.getRawValue();
    if (newPassword === confirmPassword) {
      const wasRequired = this.changeRequired();
      this.passwordService.save(newPassword, currentPassword).subscribe({
        next: () => {
          this.success.set(true);
          if (wasRequired) {
            // Read the account again, so the Gateway opens up, and carry on where a new user starts
            this.accountService.identity(true).subscribe(() => this.router.navigate(['']));
          }
        },
        error: () => this.error.set(true),
      });
    } else {
      this.doNotMatch.set(true);
    }
  }
}
