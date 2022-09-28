import { User } from './User';
import { Thing } from './Thing';
import { Subreddit } from '../Subreddit';
import { Award } from './Award';

/**
 * Represents a single subreddit comment.
 */
export class Comment extends Thing {
  public name!: string;
  public author!: string;
  public authorId!: string;
  public body!: string;
  public bodyHtml!: string;
  public created!: number;
  public parentId!: string;
  public createdUtc!: number;
  public archived!: boolean;
  public edited!: boolean;
  public locked!: boolean;
  public numReports!: number;
  public stickied!: boolean;
  public linkId!: string;
  public linkPermalink!: string;
  public linkTitle!: string;
  public linkAuthor!: string;
  public controversiality!: number;
  public allAwardings!: Award[];

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

  /**
   *
   */
  public getTypePrefix(): string {
    return 't1';
  }

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
}
