import { Api } from './Api';
import { Storage } from './Storage';
import { Comment } from './objects/Comment';
import { ModQueueItem } from './objects/ModQueueItem';
import { Moderator } from './objects/Moderator';
import { Note } from './objects/Note';
import { Rule } from './objects/Rule';
import { Post } from './objects/Post';
import { WikiPage } from './objects/WikiPage';
import { Snoomoji } from './objects/Snoomoji';
import { AboutSubreddit } from './objects/AboutSubreddit';

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
    public readonly api: Api,
    protected readonly storage: Storage,
    public storagePrefix: string,
  ) {
  }

  /**
   *
   */
  public about = async (): Promise<AboutSubreddit> => {
    const resp = await this.api.get<any>(`/r/${this.name}/about`);

    return new AboutSubreddit(this, resp.data);
  }

  /**
   *
   */
  public getEmojis = async (): Promise<Snoomoji[]> => {
    const resp = await this.api.get<any>(`/api/v1/${this.name}/emojis/all`);
    if (!resp.snoomojis) {
      return [];
    }

    const snoomojis: Snoomoji[] = [];
    Object.keys(resp.snoomojis).forEach((key) => {
      snoomojis.push(new Snoomoji(this, snoomojis[key as any], key));
    });

    return snoomojis;
  }

  /**
   *
   */
  public getModerators = async (): Promise<Moderator[]> => {
    const resp = await this.api.get<any>(`/r/${this.name}/about/moderators`);

    return resp.data.children.map((child: any) => {
      return new Moderator(this, child);
    });
  }

  /**
   *
   */
  public getModQueue = async (): Promise<ModQueueItem[]> => {
    const resp = await this.api.get<any>(`/r/${this.name}/about/modqueue`);
    const queue: ModQueueItem[] = [];
    for (let i = 0; i < resp.data.children.length; i++) {
      queue.push(new ModQueueItem(this, resp.data.children[i].data));
    }

    return queue;
  }

  /**
   *
   */
  public getRules = async (): Promise<Rule[]> => {
    const resp = await this.api.get<any>(`/r/${this.name}/about/rules`);

    return (resp.rules || []).map((rule: any) => new Rule(this, rule));
  }

  /**
   * @param username
   */
  public getUserNotes = async (username: string): Promise<Note[]> => {
    const resp = await this.api.get<any>(`/api/mod/notes?user=${username}&subreddit=${this.name}`);

    return resp.mod_notes.filter((note: any) => {
      return note.type === 'NOTE';
    }).map((note: any) => new Note(this, note, username));
  }

  /**
   * @param username
   * @param label
   * @param commentId
   * @param note
   */
  public saveUserNote = async (username: string, label: string, commentId: string, note: string): Promise<Note> => {
    const resp = await this.api.post<{ created: Note }>('/api/mod/notes', {
      user: username,
      subreddit: this.name,
      reddit_id: `t1_${commentId}`,
      label,
      note,
    });

    return new Note(this, resp.created, username);
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
    await this.api.post<any>(`/r/${this.name}/api/friend`, {
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
   *
   */
  public getPosts = async (sort: 'new'|'top'|'hot' = 'hot'): Promise<Post[]> => {
    const resp = await this.api.get<any>(`/r/${this.name}/${sort}.json`);

    return resp.data.children.map((child: any) => {
      return new Post(this, child.data);
    });
  }

  /**
   *
   */
  public getComments = async (): Promise<Comment[]> => {
    const resp = await this.api.get<any>(`/r/${this.name}/comments.json`);

    return resp.data.children.map((child: any) => {
      return new Comment(this, child.data);
    });
  }

  /**
   * @param commentId
   */
  public getComment = async (commentId: string): Promise<Comment|null> => {
    const resp = await this.api.get<any>(`/r/${this.name}/api/info?id=t1_${commentId.replace('t1_', '')}`);
    if (resp.data.children.length === 0) {
      return null;
    }

    return new Comment(this, resp.data.children[0].data);
  }

  /**
   * @param page
   */
  public getWikiPage = async (page: string): Promise<WikiPage> => {
    const resp = await this.api.get<any>(`/r/${this.name}/wiki/${page}`);

    return new WikiPage(this, resp.data, page);
  }

  /**
   *
   */
  public clearCaches = async (): Promise<void> => {}
}
