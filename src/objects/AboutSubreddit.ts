import { SubRedditObject } from './SubRedditObject';

/**
 *
 */
export class AboutSubreddit extends SubRedditObject {
  public id!: string;
  public name!: string;
  public title!: string;
  public displayName!: string;
  public description!: string;
  public activeUserCount!: number;
  public iconImg!: string;
  public subscribers!: number;
  public created!: number;
  public createdUtc!: number;
}
