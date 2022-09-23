import { Thing } from './Thing';

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

  /**
   *
   */
  public getTypePrefix(): string {
    return 't3';
  }
}
