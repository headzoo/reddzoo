import { SubRedditObject } from './SubRedditObject';

/**
 *
 */
export class ModQueueItem extends SubRedditObject {
  public readonly id!: string;
  public readonly name!: string;
  public readonly approved!: boolean;
  public readonly author!: string;
  public readonly created!: number;
  public readonly createdUtc!: number;
  public readonly modReports!: string[];
  public readonly permalink!: string;
  public readonly url!: string;
}
