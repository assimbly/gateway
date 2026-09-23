import { Component, inject, input } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemePreference, ThemeService } from 'app/core/theme';
import { TranslateDirective } from 'app/shared/language';

type ThemeOption = {
  value: ThemePreference;
  icon: 'desktop' | 'sun' | 'moon';
  labelKey: string;
};

@Component({
  selector: 'jhi-theme-selector',
  imports: [FontAwesomeModule, TranslateDirective, TranslatePipe],
  templateUrl: './theme-selector.html',
  styleUrl: './theme-selector.scss',
})
export default class ThemeSelector {
  readonly compact = input(false);
  readonly themeService = inject(ThemeService);

  readonly options: ThemeOption[] = [
    { value: 'SYSTEM', icon: 'desktop', labelKey: 'theme.system' },
    { value: 'LIGHT', icon: 'sun', labelKey: 'theme.light' },
    { value: 'DARK', icon: 'moon', labelKey: 'theme.dark' },
  ];

  select(preference: ThemePreference): void {
    this.themeService.setPreference(preference);
  }
}
