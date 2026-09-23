export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK';
export type ThemeAppearance = 'light' | 'dark';

export const THEME_PREFERENCES: readonly ThemePreference[] = ['SYSTEM', 'LIGHT', 'DARK'];
export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'SYSTEM';
export const THEME_STORAGE_KEY = 'jhi-theme-preference';

export function parseThemePreference(value: unknown): ThemePreference {
  if (value === 'LIGHT' || value === 'DARK' || value === 'SYSTEM') {
    return value;
  }
  return DEFAULT_THEME_PREFERENCE;
}

export function resolveThemeAppearance(preference: ThemePreference, systemDark: boolean): ThemeAppearance {
  if (preference === 'DARK') {
    return 'dark';
  }
  if (preference === 'LIGHT') {
    return 'light';
  }
  return systemDark ? 'dark' : 'light';
}
