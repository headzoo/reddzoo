import { RedditObject } from './RedditObject';

/**
 *
 */
export class User extends RedditObject {
  public name!: string;
  public created!: number;
  public createdUtc!: number;
  public hasMail!: boolean;
  public hasModMail!: boolean;
  public iconImg!: string;
  public snoovatarImg!: string;
  public snoovatarSize!: [number, number]|null;
  public inboxCount!: number;
  public isMod!: boolean;
  public linkKarma!: number;
  public commentKarma!: number;
  public totalKarma!: number;
  public prefNightmode!: boolean;
}
