import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config';

@Injectable()
export class CustomLogger extends ConsoleLogger {
  constructor(private configService: ConfigService<EnvironmentVariables>) {
    super();
    const levels: LogLevel[] = ['log', 'warn', 'error', 'fatal'];
    const env =
      this.configService.get<EnvironmentVariables['NODE_ENV']>('NODE_ENV');
    if (env === 'development') {
      levels.push('debug', 'verbose');
    }
    this.setLogLevels(levels);
  }
}
