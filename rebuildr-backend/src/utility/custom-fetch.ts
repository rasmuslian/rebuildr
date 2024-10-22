import { Logger } from '@nestjs/common';
import { InternalServerException } from 'src/exceptions';

export class CustomFetch {
  private headers: { [key: string]: string };
  private logger: Logger;
  constructor(logger: Logger, headers?: { [key: string]: string }) {
    this.logger = logger;
    this.headers = headers;
  }

  async send(
    url: string,
    options: {
      body?: object;
      method: 'POST' | 'GET' | 'PUT';
      headers?: { [key: string]: string };
    },
  ) {
    try {
      this.logger.log('fetch: ', {
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

      const response = await data.json();
      this.logger.log('fetch response: ', response);
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
