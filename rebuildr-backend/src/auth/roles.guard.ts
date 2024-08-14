import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<UserRoleEnum[]>(
      Roles,
      context.getHandler(),
    );
    const user = GqlExecutionContext.create(context).getContext().req.user;

    //No roles required
    if (!roles) {
      return true;
    }

    //This guard assumed req.user has been populated by another guard
    if (!user) {
      return false;
    }

    return roles.some((role) => user.role === role);
  }
}
