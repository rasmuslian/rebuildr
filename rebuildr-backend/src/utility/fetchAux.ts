import { Logger } from '@nestjs/common';
import { InternalServerException } from 'src/exceptions';

export const fetchAux = async (
  vars: {
    url: string;
    method: 'POST' | 'GET' | 'PUT';
    body?: object;
    headers: { [key: string]: string };
  },
  logger: Logger,
) => {
  try {
    logger.log('fetch: ', {
      url: vars.url,
      method: vars.method,
      body: vars.body,
    });
    const data = await fetch(vars.url, {
      method: vars.method,
      body: vars.body ? JSON.stringify(vars.body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...vars.headers,
      },
    });

    const response = await data.json();
    logger.log('fetch response: ', response);
    if (!data.ok) {
      throw InternalServerException(`HTTP error: ${data.status}`);
    }
    return response;
  } catch (e) {
    logger.error(e);
    throw InternalServerException();
  }
};
