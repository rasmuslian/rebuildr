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

export const BadFieldsInputException = (
  badFields: {
    message: string;
    name: string;
  }[],
) => {
  return new GraphQLError(`Bad input for one or more fields`, {
    extensions: {
      code: 'BAD_FIELDS_INPUT',
      fields: badFields.map((badField) => ({
        name: badField.name,
        message: badField.message,
      })),
    },
  });
};
