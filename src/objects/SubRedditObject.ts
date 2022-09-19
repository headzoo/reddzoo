import { RedditObject } from './RedditObject';
import { Subreddit } from '@src/Subreddit';

/**
 * Base object class.
 */
export class SubRedditObject extends RedditObject {
  /**
   * @param subreddit
   * @param raw
   */
  constructor(public readonly subreddit: Subreddit, raw: any) {
    super(subreddit.api, raw);
  }
}
