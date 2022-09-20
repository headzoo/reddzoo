import { Event } from './Event';

/**
 *
 */
export class AuthErrorEvent extends Event {
  /**
   *
   * @param error
   */
  constructor(public readonly error: Error) {
    super('error');
  }
}
