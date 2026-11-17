import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Account, AccountService } from 'app/core/auth';
import { ThemePreference, ThemeService } from 'app/core/theme';
import { AlertError } from 'app/shared/alert';
import ThemeSelector from 'app/shared/theme/theme-selector';
import { SaveShortcutDirective } from 'app/shared/keyboard';

const initialAccount: Account = {} as Account;

@Component({
  selector: 'jhi-settings',
  imports: [AlertError, ReactiveFormsModule, ThemeSelector, SaveShortcutDirective],
  templateUrl: './settings.html',
})
export default class Settings implements OnInit {
  readonly success = signal(false);

  settingsForm = new FormGroup({
    firstName: new FormControl(initialAccount.firstName, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    lastName: new FormControl(initialAccount.lastName, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    email: new FormControl(initialAccount.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    themePreference: new FormControl<ThemePreference>(initialAccount.themePreference ?? 'SYSTEM', { nonNullable: true }),
    activated: new FormControl(initialAccount.activated, { nonNullable: true }),
    authorities: new FormControl(initialAccount.authorities, { nonNullable: true }),
    imageUrl: new FormControl(initialAccount.imageUrl, { nonNullable: true }),
    login: new FormControl(initialAccount.login, { nonNullable: true }),
  });

  private readonly accountService = inject(AccountService);
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.settingsForm.patchValue(account);
      }
    });
  }

  save(): void {
    this.success.set(false);

    const account = this.settingsForm.getRawValue();
    account.themePreference = this.themeService.preference();
    this.accountService.save(account).subscribe({
      next: () => {
        this.success.set(true);

        this.accountService.authenticate(account);
      },
      error() {
        // Handled by interceptor.
      },
    });
  }
}
