import { SubRedditObject } from './SubRedditObject';

export interface AwardIcon {
  height: number;
  width: number;
  url: string;
}

/**
 *
 */
export class Award extends SubRedditObject {
  public id!: string;
  public name!: string;
  public coinPrice!: number;
  public coinReward!: number;
  public count!: number;
  public description!: string;
  public iconUrl!: string;
  public iconWidth!: number;
  public isEnabled!: boolean;
  public resizedIcons!: AwardIcon[];
  public resizedStaticIcons!: AwardIcon[];
  public staticIconHeight!: number;
  public staticIconWidth!: number;
  public staticIconUrl!: string;
}
