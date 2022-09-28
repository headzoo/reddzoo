import { Thing } from './Thing';
import { Subreddit } from '../Subreddit';
import { Award } from './Award';

/**
 *
 */
export class Post extends Thing {
  public name!: string;
  public url!: string;
  public selftext!: string;
  public selftextHtml!: string;
  public isSelf!: boolean;
  public author!: string;
  public authorFullName!: string;
  public title!: string;
  public linkFlairText!: string;
  public linkFlairBackgroundColor!: string;
  public linkFlairTextColor!: string;
  public authorFlairType!: string;
  public numReports!: number;
  public numComments!: number;
  public domain!: string;
  public created!: number;
  public createdUtc!: number;
  public thumbnail!: string;
  public thumbnailHeight!: string;
  public thumbnailWidth!: string;
  public allAwardings!: Award[];

  /**
   *
   */
  public getTypePrefix(): string {
    return 't3';
  }

  /**
   * @param subreddit
   * @param raw
   */
  constructor(subreddit: Subreddit, raw: any) {
    super(subreddit, raw);

    if (raw.all_awardings) {
      this.allAwardings = [];
      for (let i = 0; i < raw.all_awardings.length; i++) {
        this.allAwardings.push(new Award(this.subreddit, raw.all_awardings[i]));
      }
    }
  }
}
