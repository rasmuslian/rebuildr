import { format, transports } from 'winston';
import { utilities } from 'nest-winston';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import LokiTransport = require('winston-loki');

const devLogger = {
  format: format.combine(format.timestamp(), utilities.format.nestLike()),
  transports: [new transports.Console()],
};

const prodLogger = {
  format: format.combine(format.timestamp(), utilities.format.nestLike()),
  transports: [
    new transports.Console(),

    new LokiTransport({
      host: 'https://logs-prod-025.grafana.net',
      labels: {
        app: 'rebuildr-backend',
        environment: process.env.GRAFANA_ENV || 'production',
        api: 'rest',
      },
      json: true,
      basicAuth:
        '1385783:glc_eyJvIjoiMTU4MDY0NSIsIm4iOiJyZWJ1aWxkci1sb2ctcG9saWN5LXJlYnVpbGRyLWxvZy1wb2xpY3ktdG9rZW4iLCJrIjoiMjY5VnFGVDk4VUk2T0gxYmUzVTZIM3d6IiwibSI6eyJyIjoicHJvZC1ldS1ub3J0aC0wIn19',
      format: format.json(),
      replaceTimestamp: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onConnectionError: (err: any) => console.error(err),
    }),
  ],
};

export const instanceLogger =
  process.env.NODE_ENV === 'production' ? prodLogger : devLogger;
