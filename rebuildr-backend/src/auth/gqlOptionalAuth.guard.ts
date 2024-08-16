import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, jwtConstants } from './constants';

@Injectable()
export class GqlOptionalAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const request = GqlExecutionContext.create(context).getContext().req;

    const [type, token] = request.headers.authorization.split(' ') ?? [];
    if (type !== 'Bearer') {
      return true;
    }
    try {
      const payload: AccessTokenPayload = await this.jwtService.verifyAsync(
        token,
        {
          secret: jwtConstants.secret,
        },
      );
      request.user = {
        id: payload.sub,
        email: payload.sub,
        role: payload.role,
      };
    } catch (e) {
      return true;
    }

    return true;
  }
}
