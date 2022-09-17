import { SubRedditObject } from './SubRedditObject';

export interface UserNoteData {
  label: string;
}

/**
 *
 */
export class Note extends SubRedditObject {
  public readonly id!: string;
  public readonly type!: string;
  public readonly createdAt!: number;
  public readonly userNoteData!: UserNoteData;
}
