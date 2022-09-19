import { OAuth2Client, OAuth2Fetch, generateCodeVerifier } from '@badgateway/oauth2-client';
import { RequestError } from './RequestError';
import { Subreddit } from './Subreddit';
import { Storage, MemoryStorage } from './Storage';
import { AuthEvent, AuthListener } from './AuthEvent';

export interface Config {
  clientId: string;
  clientSecret: string;
}

export interface User {
  name: string;
  created: number;
  created_utc: number;
  has_mail: boolean;
  has_mod_mail: boolean;
  icon_img: string;
  snoovatar_img: string;
  snoovatar_size: [number, number]|null;
  inbox_count: number;
  is_mod: boolean;
  link_karma: number;
  comment_karma: number;
  total_karma: number;
}

/**
 *
 */
export class Api {
  public storagePrefix = 'ReddZoo.';
  public authExpiration = 0;
  protected readonly redirectUri = 'https://headzoo.io/modchrome/auth';
  protected readonly baseUrl = 'https://oauth.reddit.com';
  protected readonly client: OAuth2Client;
  protected readonly storage: Storage;
  protected request: OAuth2Fetch;
  protected me: User|null = null;
  protected authListeners: AuthListener[] = [];
  protected username: string|null = null;
  protected password: string|null = null;

  /**
   * @param config
   * @param id
   * @param storage
   */
  constructor(protected config: Config, protected readonly id: string, storage: Storage | null = null) {
    this.storage = storage || new MemoryStorage();
    this.client = new OAuth2Client({
      server: 'https://www.reddit.com',
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      tokenEndpoint: '/api/v1/access_token',
      authorizationEndpoint: '/api/v1/authorize',
    });
    this.request = this.createRequest();
  }

  /**
   * @param listener
   */
  public onAuthChange = (listener: AuthListener): void => {
    this.authListeners.push(listener);
    const e = new AuthEvent(this.me ? this.me.name : '',  this.isAuthenticated());
    listener(e);
  }

  /**
   *
   */
  public preAuthenticate = async (): Promise<void> => {
    const token = await this.storage.get(`${this.storagePrefix}authToken.${this.id}`);
    if (token) {
      this.request = this.createRequest();
      const m = await this.storage.get(`${this.storagePrefix}authMe.${this.id}`);
      if (m) {
        this.me = m;
        await this.triggerAuth(true);
      }
    }
    // const creds = await this.storage.get(`${this.storagePrefix}authCreds.${this.id}`);
    /*if (creds) {
      this.request = this.createRequest();
      const m = await this.storage.get(`${this.storagePrefix}authMe.${this.id}`);
      if (m) {
        this.me = m;
        await this.triggerAuth(true);
      }
    }*/
  }

  /**
   *
   */
  public beginOauthFlow = async (): Promise<void> => {
    const codeVerifier = await generateCodeVerifier();
    const scopes = 'identity,edit,flair,history,modconfig,modflair,modlog,modposts,modwiki,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote,wikiedit,wikiread';
    const url = `https://www.reddit.com/api/v1/authorize?client_id=${this.config.clientId}&response_type=code&state=${codeVerifier}&redirect_uri=${encodeURIComponent(this.redirectUri)}&duration=permanent&scope=${encodeURIComponent(scopes)}`
    if (chrome && chrome.tabs) {
      await chrome.tabs.create({url});
    } else {
      window.open(url);
    }
  }

  /**
   * @param url
   */
  public verifyOauthResponse = async (url: string): Promise<boolean> => {
    const codeVerifier = await generateCodeVerifier();
    const oauth2Token = await this.client.authorizationCode.getTokenFromCodeRedirect(url, {
        redirectUri: this.redirectUri,
        codeVerifier,
    });
    await this.storage.set(`${this.storagePrefix}authToken.${this.id}`, oauth2Token);
    this.request = this.createRequest();

    return !!oauth2Token;
  }

  /**
   * @param username
   * @param password
   */
  public signIn = async (username = '', password = ''): Promise<boolean> => {
    try {
      this.me = null;
      this.username = null;
      this.password = null;

      if (username && password) {
        this.username = username;
        this.password = password;
        this.request = this.createRequest();
      }

      const m = await this.storage.get(`${this.storagePrefix}authMe.${this.id}`);
      if (m) {
        this.me = m;
        if ((await this.triggerAuth(true)).isPrevented) {
          this.me = null;
          return false;
        }

        return true;
      }

      const resp = await this.request.fetch(`${this.baseUrl}/api/v1/me`, {
        method: 'GET',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }),
      });
      if (!resp.ok && resp.status === 401) {
        await this.triggerAuth(false);
        return false;
      }

      this.me = await resp.json();
      await this.storage.set(`${this.storagePrefix}authMe.${this.id}`, this.me, this.authExpiration);
      if ((await this.triggerAuth(true)).isPrevented) {
        await this.logOut();
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
    }

    await this.triggerAuth(false);

    return false;
  }

  /**
   *
   */
  public logOut = async (): Promise<void> => {
    await this.storage.remove(`${this.storagePrefix}authMe.${this.id}`);
    await this.storage.remove(`${this.storagePrefix}authToken.${this.id}`);
    this.me = null;
    this.username = null;
    this.password = null;
    await this.triggerAuth(false);
  }

  /**
   *
   */
  public isAuthenticated = (): boolean => {
    return this.me !== null;
  }

  /**
   * @param isAuthenticated
   */
  public triggerAuth = async (isAuthenticated: boolean): Promise<AuthEvent> => {
    const e = new AuthEvent(this.me ? this.me.name : '',  isAuthenticated);
    for (let i = 0; i < this.authListeners.length; i++) {
      const listener = this.authListeners[i];
      listener(e);
      if (isAuthenticated && e.isPrevented) {
        await this.logOut();
        return e;
      }
    }

    return e;
  }

  /**
   *
   */
  public getMe = (): User|null => {
    return this.me;
  }

  /**
   * @param username
   */
  public getUser = async (username: string): Promise<User|null> => {
    const resp = await this.get<any>(`/user/${username}/about`);
    if (!resp || !resp.data) {
      return null;
    }

    return resp.data;
  }

  /**
   * @param name
   */
  public getSubreddit = (name: string): Subreddit => {
    return new Subreddit(name, this, this.storage, this.storagePrefix);
  }

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

    const resp = await this.request.fetch(`${this.baseUrl}${path}`, config);
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

  /**
   *
   */
  protected createRequest = (): OAuth2Fetch => {
    return new OAuth2Fetch({
      client: this.client,
      getNewToken: async () => {
        if (this.username && this.password) {
          return this.client.password({
            username: this.username,
            password: this.password,
          });
        }
        return null;
      },
      storeToken: async (token) => {
        await this.storage.set(`${this.storagePrefix}authToken.${this.id}`, token);
      },
      getStoredToken: async () => {
        return await this.storage.get(`${this.storagePrefix}authToken.${this.id}`, null);
      },
      onError: (err) => {
        console.error(err);
      }
    });
  }
}
