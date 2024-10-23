import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config';
import { UserRoleEnum } from 'src/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService<EnvironmentVariables>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      signOptions: {
        expiresIn: jwtConstants.expiresIn,
      },
    });
  }

  async validate(payload: { sub: string; email: string; role: UserRoleEnum }) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
