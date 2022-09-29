import { Api } from '../Api';

/**
 * Base object class.
 */
export class RedditObject {
  protected snakeToCamelRegEx = new RegExp('([-_][a-z])', 'g');
  protected readonly raw: any;

  /**
   * @param api
   * @param raw
   */
  constructor(public readonly api: Api, raw: any) {
    this.raw = raw;
    this.mergeValues(raw);
  }

  /**
   *
   */
  public toJSON = (): any => {
    return this.snakeToCamel(this.raw);
  }

  /**
   * @param raw
   */
  protected snakeToCamel = (raw: Record<string, any>): Record<string, any> => {
    const records: Record<string, any> = {};
    Object.keys(raw).map((key) => {
      const c = key.toLowerCase().replace(this.snakeToCamelRegEx, (group: string) =>
        group
          .toUpperCase()
          .replace('-', '')
          .replace('_', '')
      );
      records[c] = raw[key];
    });

    return records;
  }

  /**
   * @param raw
   */
  protected mergeValues = (raw: any): void => {
    const values = this.snakeToCamel(raw);
    Object.keys(values).forEach((key) => {
      if (key !== 'subreddit' && key !== 'api') {
        // @ts-ignore
        this[key] = values[key];
      }
    });
  }
}
