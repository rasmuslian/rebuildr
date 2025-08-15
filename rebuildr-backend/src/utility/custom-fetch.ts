import { InternalServerException } from 'src/exceptions';
import { Logger } from 'winston';

export class CustomFetch {
  private headers: Record<string, string>;
  private logger: Logger;
  constructor(logger: Logger, headers?: Record<string, string>) {
    this.logger = logger;
    this.headers = headers;
  }

  async send(
    url: string,
    options: {
      body?: object;
      method: 'POST' | 'GET' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
    },
  ) {
    try {
      this.logger.info({
        message: 'fetch',
        url: url,
        method: options.method,
        body: options.body,
      });
      const data = await fetch(url, {
        method: options.method,
        body: options.body ? JSON.stringify(options.body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
          ...options.headers,
        },
      });
      const text = await data.text();
      const response = text ? JSON.parse(text) : null;
      this.logger.info({ message: 'fetch response: ', response });
      if (!data.ok) {
        throw InternalServerException(`HTTP error: ${data.status}`);
      }
      return response;
    } catch (e) {
      this.logger.error(e);
      throw InternalServerException();
    }
  }
}
