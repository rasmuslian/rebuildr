import { UserRoleEnum } from 'src/entities/user.entity';

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.NODE_ENV === 'development' ? '300s' : '3600s',
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRoleEnum;
};

export type AuthedUserType = {
  id: string;
  email: string;
  role: UserRoleEnum;
};
