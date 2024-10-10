import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthedUserType => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
