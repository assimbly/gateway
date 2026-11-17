import { Component, inject, input } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ThemePreference, ThemeService } from 'app/core/theme';

type ThemeOption = {
  value: ThemePreference;
  icon: 'desktop' | 'sun' | 'moon';
  label: string;
};

@Component({
  selector: 'jhi-theme-selector',
  imports: [FontAwesomeModule],
  templateUrl: './theme-selector.html',
  styleUrl: './theme-selector.scss',
})
export default class ThemeSelector {
  readonly compact = input(false);
  readonly themeService = inject(ThemeService);

  readonly options: ThemeOption[] = [
    { value: 'SYSTEM', icon: 'desktop', label: 'System' },
    { value: 'LIGHT', icon: 'sun', label: 'Light' },
    { value: 'DARK', icon: 'moon', label: 'Dark' },
  ];

  select(preference: ThemePreference): void {
    this.themeService.setPreference(preference);
  }
}
