import { Event } from './Event';

/**
 *
 */
export class SignOutEvent extends Event {
  /**
   * @param id
   */
  constructor(public readonly id: string) {
    super('signOut');
  }
}
