import { format, transports } from 'winston';
import { utilities } from 'nest-winston';

const devLogger = {
  format: format.combine(format.timestamp(), utilities.format.nestLike()),
  transports: [new transports.Console()],
};

const prodLogger = {
  format: format.combine(format.timestamp(), utilities.format.nestLike()),
  transports: [new transports.Console()],
};

export const instanceLogger =
  process.env.NODE_ENV === 'production' ? prodLogger : devLogger;
