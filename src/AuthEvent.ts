/**
 *
 */
export class AuthEvent {
  public isPrevented = false;

  /**
   * @param username
   * @param isAuthenticated
   */
  constructor(public readonly username: string, public readonly isAuthenticated: boolean) {
  }

  /**
   *
   */
  public preventAuth = (): void => {
    this.isPrevented = true;
  }
}

export type AuthListener = (e: AuthEvent) => void;
