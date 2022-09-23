import { SubRedditObject } from './SubRedditObject';

/**
 *
 */
export abstract class Thing extends SubRedditObject {
  public id!: string;
  public likes!: boolean|null;
  public downs!: number;
  public ups!: number;
  public score!: number;
  public approved!: boolean;
  public removed!: boolean;
  public permalink!: string;
  public modReports!: string[];

  /**
   *
   */
  public abstract getTypePrefix(): string;

  /**
   *
   */
  public ignoreReports = async (): Promise<boolean> => {
    await this.api.post<any>(`/api/ignore_reports?id=${this.getTypePrefix()}_${this.id}`);

    return true;
  }

  /**
   * @param dir
   */
  public vote = async (dir: 1|0|-1): Promise<boolean> => {
    await this.api.post<any>(`/api/vote?id=${this.getTypePrefix()}_${this.id}&dir=${dir}`);

    return true;
  }

  /**
   *
   */
  public approve = async (): Promise<boolean> => {
    await this.api.post<any>(`/api/approve?id=${this.getTypePrefix()}_${this.id}`);

    return true;
  }

  /**
   * @param spam
   */
  public remove = async (spam = false): Promise<boolean> => {
    await this.api.post<any>(`/api/remove?id=${this.getTypePrefix()}_${this.id}&spam=${spam ? 1 : 0}`);

    return true;
  }
}
