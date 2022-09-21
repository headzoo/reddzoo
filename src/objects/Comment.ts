import { SubRedditObject } from './SubRedditObject';
import { User } from './User';

/**
 * Represents a single subreddit comment.
 */
export class Comment extends SubRedditObject {
  public readonly id!: string;
  public readonly name!: string;
  public readonly author!: string;
  public readonly authorId!: string;
  public readonly body!: string;
  public readonly bodyHtml!: string;
  public readonly created!: number;
  public readonly createdUtc!: number;
  public readonly downs!: number;
  public readonly ups!: number;
  public readonly score!: number;
  public readonly permalink!: string;
  public readonly approved!: boolean;
  public readonly archived!: boolean;
  public readonly edited!: boolean;
  public readonly locked!: boolean;
  public readonly numReports!: number;
  public readonly stickied!: boolean;
  public readonly linkId!: string;
  public readonly linkPermalink!: string;
  public readonly linkTitle!: string;
  public readonly linkAuthor!: string;

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
   *
   */
  public ignoreReports = async (): Promise<boolean> => {
    await this.api.post<any>(`/api/ignore_reports?id=t1_${this.id}`);

    return true;
  }
}
