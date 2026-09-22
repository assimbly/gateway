import { ThemePreference } from 'app/core/theme/theme.model';

export class Account {
  constructor(
    public activated: boolean,
    public authorities: string[],
    public email: string,
    public firstName: string | null,
    public langKey: string,
    public lastName: string | null,
    public login: string,
    public imageUrl: string | null,
    public themePreference: ThemePreference = 'SYSTEM',
  ) {}
}
