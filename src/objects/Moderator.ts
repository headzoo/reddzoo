import { SubRedditObject } from './SubRedditObject';

/**
 *
 */
export class Moderator extends SubRedditObject {
  public id!: string;
  public relId!: string;
  public date!: number;
  public name!: string;
  public authorFlairCssClass!: string;
  public authorFlairText!: string;
  public modPermissions!: string[];
}
