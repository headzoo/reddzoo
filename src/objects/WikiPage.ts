import { SubRedditObject } from './SubRedditObject';
import { Subreddit } from '../Subreddit';

/**
 *
 */
export class WikiPage extends SubRedditObject {
  public page: string;
  public contentHtml!: string;
  public contentMd!: string;
  public reason!: string;
  public revisionDate!: number;
  public revisionId!: string;

  /**
   * @param subreddit
   * @param raw
   * @param page
   */
  constructor(subreddit: Subreddit, raw: any, page: string) {
    super(subreddit, raw);
    this.page = page;
  }

  /**
   * @param content
   */
  public update = async (content: string): Promise<boolean> => {
    await this.api.post<any>(`/r/${this.subreddit.name}/api/wiki/edit?page=${this.page}`, {
      content,
    });
    return true;
  }
}
