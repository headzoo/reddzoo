import { Api } from './Api';
import { Storage } from '@src/Storage';

export interface ModQueueItem {
  id: string;
  name: string;
  approved: boolean;
  author: string;
  created: number;
  created_utc: number;
  mod_reports: string[];
  permalink: string;
  url: string;
}

export interface Note {
  id: string;
  type: string;
  created_at: number;
  user_note_data: {
    label: string;
  }
}

export interface Rule {
  description: string;
  short_name: string;
  created_utc: number;
  priority: 0;
  violation_reason: string;
}

export interface Comment {
  id: string;
  name: string;
  author: string;
  body: string;
  body_html: string;
  created: number;
  created_utc: number;
  downs: number;
  ups: number;
  score: number;
  permalink: string;
}

export interface WikiPage {
  content_html: string;
  content_md: string;
  reason: string;
  revision_date: number;
  revision_id: string;
}

/**
 * Represents access to a subreddit.
 */
export class Subreddit {
  /**
   * @param api
   * @param name
   * @param storage
   * @param storagePrefix
   */
  constructor(
    public readonly name: string,
    protected readonly api: Api,
    protected readonly storage: Storage,
    public storagePrefix: string,
  ) {
  }

  /**
   *
   */
  public getModQueue = async (): Promise<ModQueueItem[]> => {
    const resp = await this.api.get<any>(`/r/${this.name}/about/modqueue`);
    const queue: ModQueueItem[] = [];
    for (let i = 0; i < resp.data.children.length; i++) {
      queue.push(resp.data.children[i].data);
    }

    return queue;
  }

  /**
   * @param expiration
   */
  public getRules = async (expiration = 0): Promise<Rule[]> => {
    const key = `${this.storagePrefix}:subreddit:${this.name}:getRules`;
    if (expiration !== 0) {
      const rules = await this.storage.get(key);
      if (rules) {
        return rules;
      }
    }

    const resp = await this.api.get<any>(`/r/${this.name}/about/rules`);
    const rules = resp.rules || [];
    if (expiration !== 0) {
      await this.storage.set(key, rules, expiration);
    }

    return rules;
  }

  /**
   * @param username
   */
  public getUserNotes = async (username: string): Promise<Note[]> => {
    const resp = await this.api.get<any>(`/api/mod/notes?user=${username}&subreddit=${this.name}`);

    return resp.mod_notes.filter((note: any) => {
      return note.type === 'NOTE';
    });
  }

  /**
   * @param username
   * @param label
   * @param commentId
   * @param note
   */
  public saveUserNote = async (username: string, label: string, commentId: string, note: string): Promise<Note> => {
    return await this.api.post<Note>('/api/mod/notes', {
      user: username,
      subreddit: this.name,
      reddit_id: `t1_${commentId}`,
      label,
      note,
    });
  }

  /**
   * @param username
   * @param commentId
   * @param banReason
   * @param banMessage
   * @param duration
   */
  public banUser = async (
    username: string,
    commentId: string,
    banReason: string,
    banMessage: string,
    duration: number,
  ): Promise<boolean> => {
    await this.api.post<any>('/r/${this.name}/api/friend', {
      type: 'banned',
      name: username,
      ban_context: `t1_${commentId}`,
      ban_reason: banReason,
      ban_message: banMessage,
      duration: duration.toString(),
    });

    return true;
  }

  /**
   * @param commentId
   */
  public getComment = async (commentId: string): Promise<Comment|null> => {
    const resp = await this.api.get<any>(`/r/${this.name}/api/info?id=t1_${commentId}`);
    if (resp.data.children.length === 0) {
      return null;
    }

    return resp.data.children[0].data;
  }

  /**
   * @param commentId
   * @param text
   */
  public saveReply = async (commentId: string, text: string): Promise<Comment|null> => {
    const resp = await this.api.post<any>('/api/comment', {
      thing_id: `t1_${commentId}`,
      api_version: 'json',
      text
    });
    if (!resp || !resp.json || !resp.json.data || resp.json.data.things.length === 0) {
      return null;
    }

    return resp.json.data.things[0].data;
  }

  /**
   * @param commentId
   */
  public distinguishComment = async (commentId: string): Promise<boolean> => {
    await this.api.post<any>('/api/distinguish', {
      id: `t1_${commentId}`,
      how: 'yes',
    });

    return true;
  }

  /**
   * @param commentId
   */
  public approveComment = async (commentId: string): Promise<boolean> => {
    await this.api.post<any>('/api/approve', {
      id: `t1_${commentId}`
    });

    return true;
  }

  /**
   * @param page
   */
  public getWikiPage = async (page: string): Promise<WikiPage> => {
    const resp = await this.api.get<any>(`/r/${this.name}/wiki/${page}`);

    return resp.data;
  }

  /**
   * @param page
   * @param content
   */
  public updateWikiPage = async (page: string, content: string): Promise<void> => {
    await this.api.post<any>(`/r/${this.name}/api/wiki/edit?page=${page}`, {
      content,
    });
  }
}
