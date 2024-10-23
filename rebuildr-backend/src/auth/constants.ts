import { UserRoleEnum } from 'src/entities/user.entity';

export const jwtConstants = {
  expiresIn: process.env.NODE_ENV === 'development' ? '300s' : '3600s',
};

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRoleEnum;
}

export interface AuthedUserType {
  id: string;
  email: string;
  role: UserRoleEnum;
}
