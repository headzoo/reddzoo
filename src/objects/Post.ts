import { SubRedditObject } from './SubRedditObject';
import { Thing } from './Thing';

/**
 *
 */
export class Post extends SubRedditObject implements Thing {
  public readonly typePrefix = 't3_';
  public id!: string;
  public name!: string;
  public permalink!: string;
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
  public downs!: number;
  public ups!: number;
  public score!: number;
  public created!: number;
  public createdUtc!: number;
  public likes!: boolean|null;

  /**
   * @param dir
   */
  public vote = async (dir: 1|0|-1): Promise<boolean> => {
    await this.api.post<any>(`/api/vote?id=t3_${this.id}&dir=${dir}`);

    return true;
  }


  /**
   * @param spam
   */
  public remove = async (spam = false): Promise<boolean> => {
    await this.api.post<any>(`/api/remove?id=t3_${this.id}&spam=${spam ? 1 : 0}`);

    return true;
  }
}
