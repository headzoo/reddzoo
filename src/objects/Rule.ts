import { SubRedditObject } from './SubRedditObject';

/**
 *
 */
export class Rule extends SubRedditObject {
  public description!: string;
  public shortName!: string;
  public createdCtc!: number;
  public priority!: number;
  public violationReason!: string;
}
