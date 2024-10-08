import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

//Used to protect user fields to only be read by user whose id matches the user to be read
export const UserProtectedMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  const user = ctx.context.req.user;
  const requestedOnUser = ctx.source;

  if (user?.id !== requestedOnUser.id) {
    throw new Error("Not allowed to access other user's data");
  }

  return value;
};
