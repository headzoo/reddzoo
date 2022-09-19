export interface Storage {
  set: (key: string, values: any, expiration?: number) => Promise<any>;
  get: <T>(key: string, defaultValue?: any) => Promise<T|null>;
  remove: (key: string) => Promise<void>;
}

/**
 * Stores values in memory.
 */
export class MemoryStorage implements Storage {
  protected readonly values: Record<string, any> = {};

  /**
   * @param key
   * @param values
   * @param expiration
   */
  set = (key: string, values: any, expiration = 0): Promise<any> => {
    return new Promise((resolve) => {
      this.values[key] = {
        _values:     values,
        _time:       (new Date()).getTime(),
        _expiration: expiration,
      };
      resolve(this.values[key]);
    });
  }

  /**
   * @param key
   * @param defaultValue
   */
  get = <T>(key: string, defaultValue: any = null): Promise<T|null> => {
    return new Promise((resolve) => {
      if (this.values[key] === undefined) {
        resolve(defaultValue);
        return;
      }

      this.resolveValue<T>(this.values, key, defaultValue)
        .then(resolve);
    });
  }

  /**
   * @param key
   */
  remove = (key: string): Promise<void> => {
    return new Promise((resolve) => {
      delete this.values[key];
      resolve();
    });
  }

  /**
   * @param resp
   * @param key
   * @param defaultValue
   */
  protected resolveValue = <T>(resp: any, key: string, defaultValue: any = undefined): Promise<T> => {
    return new Promise((resolve) => {
      const stored = resp[key];
      const { _expiration, _time, _values, ...rest } = stored;
      if (_expiration !== undefined && _time !== undefined && _expiration !== 0) {
        const diff = (new Date()).getTime() - _time;
        if (diff >= _expiration) {
          delete this.values[key];
          resolve(defaultValue);
          return;
        }
      }

      if (_values !== undefined) {
        resolve(_values);
      } else if (rest) {
        resolve(rest);
      } else {
        resolve(defaultValue);
      }
    });
  };
}
