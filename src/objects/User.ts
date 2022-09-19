import { RedditObject } from './RedditObject';

/**
 *
 */
export class User extends RedditObject {
  public readonly name!: string;
  public readonly created!: number;
  public readonly createdUtc!: number;
  public readonly hasMail!: boolean;
  public readonly hasModMail!: boolean;
  public readonly iconImg!: string;
  public readonly snoovatarImg!: string;
  public readonly snoovatarSize!: [number, number]|null;
  public readonly inboxCount!: number;
  public readonly isMod!: boolean;
  public readonly linkKarma!: number;
  public readonly commentKarma!: number;
  public readonly totalKarma!: number;
}
