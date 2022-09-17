import { SubRedditObject } from './SubRedditObject';

/**
 *
 */
export class Rule extends SubRedditObject {
  public readonly description!: string;
  public readonly shortName!: string;
  public readonly createdCtc!: number;
  public readonly priority!: number;
  public readonly violationReason!: string;
}
