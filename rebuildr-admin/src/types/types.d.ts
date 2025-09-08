type ResponseError = {
  extensions: { code: string };
  message?: string;
  path: string[];
};

type GraphQLResponse<T> = { data?: T; errors?: ResponseError[] };
