import { DEFAULT_THEME_PREFERENCE, parseThemePreference, resolveThemeAppearance } from './theme.model';

describe('theme model', () => {
  it('parses known preferences and defaults unknown values to SYSTEM', () => {
    expect(parseThemePreference('LIGHT')).toBe('LIGHT');
    expect(parseThemePreference('DARK')).toBe('DARK');
    expect(parseThemePreference('SYSTEM')).toBe('SYSTEM');
    expect(parseThemePreference(null)).toBe(DEFAULT_THEME_PREFERENCE);
    expect(parseThemePreference('sepia')).toBe('SYSTEM');
  });

  it('resolves SYSTEM from the operating system and ignores it for explicit choices', () => {
    expect(resolveThemeAppearance('SYSTEM', true)).toBe('dark');
    expect(resolveThemeAppearance('SYSTEM', false)).toBe('light');
    expect(resolveThemeAppearance('LIGHT', true)).toBe('light');
    expect(resolveThemeAppearance('DARK', false)).toBe('dark');
  });
});
