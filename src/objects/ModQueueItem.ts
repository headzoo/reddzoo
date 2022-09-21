import { SubRedditObject } from './SubRedditObject';

/**
 *
 */
export class ModQueueItem extends SubRedditObject {
  public id!: string;
  public name!: string;
  public approved!: boolean;
  public author!: string;
  public created!: number;
  public createdUtc!: number;
  public modReports!: string[];
  public permalink!: string;
  public url!: string;
}
