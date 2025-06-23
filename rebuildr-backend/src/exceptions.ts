import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';

export const BadUserInputException = (message?: string) => {
  return new GraphQLError(message ?? 'Bad request', {
    extensions: {
      code: ApolloServerErrorCode.BAD_USER_INPUT,
    },
  });
};

export const InternalServerException = (message?: string) => {
  return new GraphQLError(message ?? 'Internal server error', {
    extensions: {
      code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
    },
  });
};

export const ForbiddenException = (message?: string) => {
  return new GraphQLError(message ?? 'Unathorized', {
    extensions: {
      code: 'FORBIDDEN',
    },
  });
};

export const ThrottleException = (message?: string) => {
  return new GraphQLError(message ?? 'Too many requests', {
    extensions: {
      code: 'THROTTLE',
    },
  });
};

export interface BadField {
  message: string;
  name: string;
  type?: 'BAD_VALUE' | 'VALUE_TAKEN';
}
/**
 *
 * @param badFields object specifying where and what went wrong
 * @param message error message
 * @param name name of field
 * @param type what type of error
 * @constant BAD_VALUE - Standard error
 * @constant VALUE_TAKEN - for example email och username which already exist in the database
 * @returns
 */
export const BadFieldsInputException = (badFields: BadField[]) => {
  return new GraphQLError(`Bad input for one or more fields`, {
    extensions: {
      code: 'BAD_FIELDS_INPUT',
      fields: badFields.map((badField) => ({
        message: badField.message,
        name: badField.name,
        type: badField.type ?? 'BAD_VALUE',
      })),
    },
  });
};

export const NotFoundException = (message?: string) => {
  return new GraphQLError(message ?? 'Not found', {
    extensions: {
      code: 'NOT_FOUND',
    },
  });
};
