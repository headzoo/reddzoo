import { Event } from './Event';
import { User } from '../objects/User';

/**
 *
 */
export class SignInEvent extends Event {
  public isPrevented = false;

  /**
   * @param username
   * @param id
   */
  constructor(public readonly username: string, public readonly id: string) {
    super('signIn');
  }

  /**
   *
   */
  public preventAuth = (): void => {
    this.isPrevented = true;
  }
}
