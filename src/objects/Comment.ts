import { SubRedditObject } from './SubRedditObject';
import { User } from './User';
import { Thing } from './Thing';

/**
 * Represents a single subreddit comment.
 */
export class Comment extends SubRedditObject implements Thing {
  public readonly typePrefix = 't1_';
  public id!: string;
  public name!: string;
  public author!: string;
  public authorId!: string;
  public body!: string;
  public bodyHtml!: string;
  public created!: number;
  public createdUtc!: number;
  public downs!: number;
  public ups!: number;
  public score!: number;
  public permalink!: string;
  public approved!: boolean;
  public removed!: boolean;
  public archived!: boolean;
  public edited!: boolean;
  public locked!: boolean;
  public numReports!: number;
  public stickied!: boolean;
  public linkId!: string;
  public linkPermalink!: string;
  public linkTitle!: string;
  public linkAuthor!: string;
  public likes!: boolean|null;

  /**
   *
   */
  public getAuthor = async (): Promise<User> => {
    const user = await this.api.getUser(this.author);
    if (!user) {
      throw new Error(`Failed to get author ${this.author}.`);
    }

    return user;
  }

  /**
   * @param text
   */
  public reply = async (text: string): Promise<Comment> => {
    const resp = await this.api.post<any>(`/api/comment?api_type=json&thing_id=t1_${this.id}`, {
      text
    });
    if (!resp || !resp.json || !resp.json.data || resp.json.data.things.length === 0) {
      throw new Error('Failed to save reply.');
    }

    return new Comment(this.subreddit, resp.json.data.things[0].data);
  }

  /**
   *
   */
  public distinguish = async (): Promise<boolean> => {
    await this.api.post<any>(`/api/distinguish?id=t1_${this.id}&how=yes`);

    return true;
  }

  /**
   *
   */
  public approve = async (): Promise<boolean> => {
    await this.api.post<any>(`/api/approve?id=t1_${this.id}`);

    return true;
  }

  /**
   * @param spam
   */
  public remove = async (spam = false): Promise<boolean> => {
    await this.api.post<any>(`/api/remove?id=t1_${this.id}&spam=${spam ? 1 : 0}`);

    return true;
  }

  /**
   *
   */
  public ignoreReports = async (): Promise<boolean> => {
    await this.api.post<any>(`/api/ignore_reports?id=t1_${this.id}`);

    return true;
  }

  /**
   * @param dir
   */
  public vote = async (dir: 1|0|-1): Promise<boolean> => {
    await this.api.post<any>(`/api/vote?id=t1_${this.id}&dir=${dir}`);

    return true;
  }
}
