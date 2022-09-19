import { RequestError } from './RequestError';
import { Subreddit } from './Subreddit';
import { Storage, MemoryStorage } from './Storage';
import { Auth } from './Auth';
import { User } from './objects/User';

export interface Config {
  clientId: string;
  clientSecret: string;
}

/**
 *
 */
export class Api {
  public authExpiration = 0;
  public storagePrefix = 'ReddZoo.';
  protected readonly redirectUri = 'https://headzoo.io/modchrome/auth';
  protected readonly baseUrl = 'https://oauth.reddit.com';
  protected readonly storage: Storage;
  public readonly auth: Auth;

  /**
   * @param config
   * @param id
   * @param storage
   * @param authExpiration
   */
  constructor(
    protected config: Config,
    protected readonly id: string = 'me',
    storage: Storage | null = null,
    authExpiration = 0,
  ) {
    this.storage = storage || new MemoryStorage();
    this.authExpiration = authExpiration;
    this.auth = new Auth(this.config, this.id, this.storage, this.storagePrefix);
  }

  /**
   *
   */
  public getMe = (): User|null => {
    if (!this.auth.me) {
      return null;
    }
    return new User(this, this.auth.me);
  }

  /**
   * @param username
   */
  public getUser = async (username: string): Promise<User|null> => {
    const resp = await this.get<any>(`/user/${username}/about`);
    if (!resp || !resp.data) {
      return null;
    }

    return new User(this, resp.data);
  }

  /**
   * @param name
   */
  public getSubreddit = (name: string): Subreddit => {
    return new Subreddit(name, this, this.storage, this.storagePrefix);
  }

  /**
   *
   */
  public clearCaches = async (): Promise<void> => {}

  /**
   * @param path
   */
  public get = async <T>(path: string): Promise<T> => {
    return await this.req<T>('GET', path);
  }

  /**
   * @param path
   * @param body
   */
  public post = async <T>(path: string, body: Record<string, string> = {}): Promise<T> => {
    return await this.req('POST', path, body);
  }

  /**
   * @param path
   */
  public delete = async <T>(path: string): Promise<T> => {
    return await this.req<T>('DELETE', path);
  }

  /**
   * @param method
   * @param path
   * @param body
   */
  protected req = async <T>(method: string, path: string, body: Record<string, string> = {}): Promise<T> => {
    let config: RequestInit;
    if (method === 'POST') {
      config = {
        method: 'POST',
        body: this.buildFormBody(body),
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }),
      };
    } else {
      config = {
        method: method,
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }),
      };
    }

    const resp = await this.auth.request.fetch(`${this.baseUrl}${path}`, config);
    if (!resp.ok) {
      throw new RequestError(resp.statusText, resp.status);
    }

    return resp.json();
  }

  /**
   * @param body
   */
  protected buildFormBody = (body: Record<string, string>) => {
    return Object.keys(body).map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`
    }).join('&');
  }
}
