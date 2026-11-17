export interface InfoResponse {
  'display-ribbon-on-profiles'?: string;
  git?: any;
  build?: any;
  activeProfiles?: string[];
  registration?: boolean;
}

export class ProfileInfo {
  constructor(
    public activeProfiles?: string[],
    public ribbonEnv?: string,
    public inProduction?: boolean,
    public openAPIEnabled?: boolean,
    /** Anyone may create an account from the sign-in page. */
    public registration?: boolean,
  ) {}
}
