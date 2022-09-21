import { SubRedditObject } from './SubRedditObject';
import { Subreddit } from '../Subreddit';

export interface UserNoteData {
  label: string;
}

/**
 *
 */
export class Note extends SubRedditObject {
  public id!: string;
  public type!: string;
  public createdAt!: number;
  public userNoteData!: UserNoteData;
  public username: string;

  /**
   * @param subreddit
   * @param raw
   * @param username
   */
  constructor(subreddit: Subreddit, raw: any, username: string) {
    super(subreddit, raw);
    this.username = username;
  }

  /**
   *
   */
  public delete = async (): Promise<boolean> => {
    await this.api.delete<any>(`/api/mod/notes?note_id=${this.id}&subreddit=${this.subreddit.name}&user=${this.username}`);
    return true;
  }
}
