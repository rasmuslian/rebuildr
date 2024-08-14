import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from 'src/entities/user.entity';

export const Roles = Reflector.createDecorator<UserRoleEnum[]>();
