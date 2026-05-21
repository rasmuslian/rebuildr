import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from './constants';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config';

@Injectable()
export class GqlOptionalAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = GqlExecutionContext.create(context).getContext().req;
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') {
      return true;
    }
    try {
      const payload: AccessTokenPayload = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get('JWT_SECRET'),
        },
      );
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return true;
    }

    return true;
  }
}
