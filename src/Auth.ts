import { generateCodeVerifier, OAuth2Client, OAuth2Fetch, OAuth2Token } from '@badgateway/oauth2-client';
import { Storage } from './Storage';
import { Config } from './Api';
import { EventEmitter } from './events/EventEmitter';
import { SignInEvent } from './events/SignInEvent';
import { SignOutEvent } from './events/SignOutEvent';
import { AuthErrorEvent } from './events/AuthErrorEvent';

interface Creds {
  username: string;
  password: string;
}

type AuthEvents = {
  signIn: (e: SignInEvent) => Promise<void>;
  signOut: (e: SignOutEvent) => Promise<void>;
  error: (e: AuthErrorEvent) => Promise<void>;
}

/**
 *
 */
export class Auth {
  public authExpiration = 0;
  protected readonly client: OAuth2Client;
  public request!: OAuth2Fetch;
  protected readonly eventEmitted: EventEmitter<AuthEvents> = new EventEmitter<AuthEvents>();
  public readonly baseUrl = 'https://oauth.reddit.com';
  public redirectUri = 'https://redderoo.com/auth/index.html';
  public me: any|null = null;
  protected keyAuthToken!: string;
  protected keyAuthCreds!: string;
  protected keyAuthMe!: string;
  public scopes: string[] = [
    'identity',
    'edit',
    'flair',
    'history',
    'modconfig',
    'modflair',
    'modlog',
    'modposts',
    'modwiki',
    'modcontributors',
    'modnote',
    'mysubreddits',
    'privatemessages',
    'read',
    'report',
    'save',
    'submit',
    'subscribe',
    'vote',
    'wikiedit',
    'wikiread',
  ];

  /**
   * @param id
   * @param config
   * @param storage
   * @param storagePrefix
   */
  constructor(
    protected config: Config,
    protected readonly id: string,
    protected readonly storage: Storage,
    protected storagePrefix: string
  ) {
    this.setStoragePrefix(storagePrefix);
    this.client = new OAuth2Client({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      server: 'https://www.reddit.com',
      tokenEndpoint: '/api/v1/access_token',
      authorizationEndpoint: '/api/v1/authorize',
    });
    this.request = this.createRequest();
  }

  /**
   * @param storagePrefix
   */
  public setStoragePrefix = (storagePrefix: string): void => {
    this.storagePrefix = storagePrefix;
    this.keyAuthToken = `${this.storagePrefix}authToken.${this.id}`;
    this.keyAuthCreds = `${this.storagePrefix}authCreds.${this.id}`;
    this.keyAuthMe = `${this.storagePrefix}authMe.${this.id}`;
  }

  /**
   * @param event
   * @param listener
   */
  public on = async <U extends keyof AuthEvents>(event: U, listener: AuthEvents[U]): Promise<void> => {
    this.eventEmitted.on(event, listener);

    if (this.me && typeof this.me === 'object' && this.me.name) {
      const e = new SignInEvent(this.me.name, this.id);
      await this.eventEmitted.emit(e);
    } else {
      await this.eventEmitted.emit(new SignOutEvent(this.id));
    }
  }

  /**
   *
   */
  public beginOauthFlow = async (): Promise<void> => {
    const codeVerifier = await generateCodeVerifier();
    const scopes = this.scopes.join(',');
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
    await this.storage.set(this.keyAuthToken, oauth2Token);

    return !!oauth2Token;
  }

  /**
   *
   */
  public authFromCache = async (): Promise<boolean> => {
    if (!this.isAuthenticated()) {
      const creds = await this.storage.get<Creds>(this.keyAuthCreds);
      if (creds && creds.username && creds.password) {
        const me = await this.storage.get<any>(this.keyAuthMe);
        if (me && typeof me === 'object' && me.name) {
          this.me = me;
          if (!(await this.emitSignIn())) {
            this.me = null;
            return false;
          }

          this.request = this.createRequest(creds);
          return true;
        } else {
          return await this.signIn(creds.username, creds.password);
        }
      }

      const token = await this.storage.get<OAuth2Token>(this.keyAuthToken);
      if (token) {
        const me = await this.storage.get<any>(this.keyAuthMe);
        if (me && typeof me === 'object' && me.name) {
          this.me = me;
          if (!(await this.emitSignIn())) {
            this.me = null;
            return false;
          }

          this.request = this.createRequest();
          return true;
        }
      }
    }

    return false;
  }

  /**
   * @param username
   * @param password
   */
  public signIn = async (username = '', password = ''): Promise<boolean> => {
    try {
      this.me = null;
      let req = this.createRequest();
      if (username && password) {
        req = this.createRequest({ username, password });
      }

      if (!username) {
        const me = await this.storage.get<any>(this.keyAuthMe);
        if (me && typeof me === 'object' && me.name) {
          this.me = me;
          if (!(await this.emitSignIn())) {
            await this.signOut();
            return false;
          }

          return true;
        }
      }

      const resp = await req.fetch(`${this.baseUrl}/api/v1/me`, {
        method: 'GET',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }),
      });
      if (!resp.ok && resp.status === 401) {
        await this.signOut();
        return false;
      }

      this.me = await resp.json();
      if (!this.me || !this.me.name) {
        await this.signOut();
        return false;
      }

      this.request = req;
      await this.storage.set(this.keyAuthMe, this.me, this.authExpiration);
      if (username && password) {
        await this.storage.set(this.keyAuthCreds, { username, password }, this.authExpiration);
      }

      if (!(await this.emitSignIn())) {
        await this.signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
    }

    await this.signOut();

    return false;
  }

  /**
   *
   */
  public signOut = async (): Promise<void> => {
    this.me = null;
    await this.storage.remove(this.keyAuthMe);
    await this.storage.remove(this.keyAuthToken);
    await this.storage.remove(this.keyAuthCreds);
    await this.emitSignOut();
    this.request = this.createRequest();
  }

  /**
   *
   */
  public isAuthenticated = (): boolean => {
    return this.me !== null;
  }

  /**
   *
   */
  public createRequest = (creds: Creds|null = null): OAuth2Fetch => {
    return new OAuth2Fetch({
      client: this.client,
      getNewToken: async () => {
        const token = await this.storage.get<OAuth2Token>(this.keyAuthToken, null);
        if (token) {
          return token;
        }
        if (creds && creds.username && creds.password) {
          return this.client.password({
            username: creds.username,
            password: creds.password,
          });
        }
        return null;
      },
      storeToken: async (token) => {
        await this.storage.set(this.keyAuthToken, token);
      },
      getStoredToken: async () => {
        return await this.storage.get(this.keyAuthToken, null);
      },
      onError: (err) => {
        console.error(err);
        this.eventEmitted.emit(new AuthErrorEvent(err));
      }
    });
  }

  /**
   *
   */
  protected emitSignIn = async (): Promise<boolean> => {
    return !(await this.eventEmitted.emit(new SignInEvent(this.me.name, this.id))).isPrevented;
  }

  /**
   *
   */
  protected emitSignOut = async (): Promise<void> => {
    await this.eventEmitted.emit(new SignOutEvent(this.id));
  }
}
