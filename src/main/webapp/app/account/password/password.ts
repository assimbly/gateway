import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { concatMap, filter, tap } from 'rxjs';

import { AccountService } from 'app/core/auth';
import { TranslateDirective } from 'app/shared/language';
import { TutorialPanelState } from 'app/tutorials/tutorial-panel.state';

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
  private readonly tutorialPanel = inject(TutorialPanelState);
  readonly account = this.accountService.account;
  /** The user still has a default password: they can't do anything else until they choose a new one. */
  readonly changeRequired = computed(() => this.account()?.passwordChangeRequired === true);
  passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(12), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(12), Validators.maxLength(50)],
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
      this.passwordService
        .save(newPassword, currentPassword)
        .pipe(
          tap(() => this.success.set(true)),
          filter(() => wasRequired),
          // Read the account again, so the Gateway opens up, and carry on where a new user starts, with the Tutorials
          tap(() => this.tutorialPanel.showOnFirstVisit()),
          // identity() never errors, so the error handler below still only sees a failed save
          concatMap(() => this.accountService.identity(true)),
        )
        .subscribe({
          next: () => this.router.navigate(['']),
          error: () => this.error.set(true),
        });
    } else {
      this.doNotMatch.set(true);
    }
  }
}
