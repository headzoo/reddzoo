import { SubRedditObject } from './SubRedditObject';
import { Subreddit } from '../Subreddit';

/**
 *
 */
export class Snoomoji extends SubRedditObject {
  public url!: string;
  public createdBy!: string;
  public modFlairOnly!: boolean;
  public postFlairAllowed!: boolean;
  public userFlairAllowed!: boolean;

  /**
   * @param subreddit
   * @param raw
   * @param name
   */
  constructor(subreddit: Subreddit, raw: any, public name: string) {
    super(subreddit, raw);
  }
}
