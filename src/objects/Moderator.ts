import { SubRedditObject } from './SubRedditObject';

/**
 *
 */
export class Moderator extends SubRedditObject {
  public readonly id!: string;
  public readonly relId!: string;
  public readonly date!: number;
  public readonly name!: string;
  public readonly authorFlairCssClass!: string;
  public readonly authorFlairText!: string;
  public readonly modPermissions!: string[];
}
