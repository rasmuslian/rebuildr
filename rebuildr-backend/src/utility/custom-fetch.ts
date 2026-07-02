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
    _url: string,
    options: {
      params?: Record<string, string>;
      body?: object;
      method: 'POST' | 'GET' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      // When true, a non-2xx response returns the parsed body instead of
      // throwing a generic InternalServerException, so callers can inspect
      // API-specific error payloads themselves.
      surfaceErrorBody?: boolean;
    },
  ) {
    try {
      let queryParams: string | undefined = undefined;
      if (options?.params && Object.keys(options.params).length) {
        queryParams = Object.entries(options.params)
          .map(
            ([key, value], i, arr) =>
              key + '=' + value.toString() + (i < arr.length - 1 ? '&' : ''),
          )
          .join('');
      }
      const url = `${_url}${queryParams ? '?' + queryParams : ''}`;
      this.logger.info({
        message: 'fetch',
        url,
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
      if (!data.ok && !options.surfaceErrorBody) {
        throw InternalServerException(`HTTP error: ${data.status}`);
      }
      return response;
    } catch (e) {
      this.logger.error(e);
      throw InternalServerException();
    }
  }
}
