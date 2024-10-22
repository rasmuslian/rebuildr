import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomLogger extends ConsoleLogger {
  constructor(private configService: ConfigService) {
    super();
    const levels: LogLevel[] = ['log', 'warn', 'error', 'fatal'];
    const env = this.configService.get('NODE_ENV');
    if (env === 'development') {
      levels.push('debug', 'verbose');
    }
    this.setLogLevels(levels);
  }
}
