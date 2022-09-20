import { SubRedditObject } from './SubRedditObject';

/**
 *
 */
export class Post extends SubRedditObject {
  public readonly id!: string;
  public readonly name!: string;
  public readonly permalink!: string;
  public readonly url!: string;
  public readonly selftext!: string;
  public readonly selftextHtml!: string;
  public readonly isSelf!: boolean;
  public readonly authorFullName!: string;
  public readonly title!: string;
  public readonly linkFlairText!: string;
  public readonly authorFlairType!: string;
  public readonly numReports!: number;
  public readonly numComments!: number;
  public readonly domain!: string;
  public readonly downs!: number;
  public readonly ups!: number;
  public readonly score!: number;
  public readonly created!: number;
  public readonly createdUtc!: number;
}
