import { Event } from './Event';

export type EventMap = {
  [key: string]: (e: any) => Promise<void>;
}

type Listeners<T> = {
  [name in keyof T]?: ((value: Event) => Promise<void>)[];
}

/**
 *
 */
export class EventEmitter<Events extends EventMap> {
  protected readonly listeners: Listeners<Events> = {};

  /**
   * @param event
   * @param listener
   */
  public on = <U extends keyof Events>(event: U, listener: Events[U]): void => {
    if (!this.listeners[event]) {
      this.listeners[event] = [listener];
    } else {
      // @ts-ignore
      this.listeners[event].push(listener);
    }
  }

  public off = <U extends keyof Events>(event: U, listener: Events[U]): void => {
    if (this.listeners[event]) {
      // @ts-ignore
      const index = this.listeners[event].indexOf(listener);
      if (index !== -1) {
        // @ts-ignore
        delete this.listeners[event][index];
      }
    }
  }

  /**
   * @param event
   */
  public emit = async <T extends Event>(event: T): Promise<T> => {
    const listeners = this.listeners[event.name];
    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        await listener(event);
      }
    }

    return event;
  }
}
