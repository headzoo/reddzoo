/**
 *
 */
export class RequestError extends Error {
  /**
   * @param msg
   * @param status
   */
  constructor(msg: string, public readonly status: number) {
    super(msg);
  }
}
