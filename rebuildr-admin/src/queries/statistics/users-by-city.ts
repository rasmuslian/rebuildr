import apiClient from "@/lib/api-client";

export interface UsersByCityEntry {
  city: string;
  count: number;
}

export interface UsersByCityResponse {
  cities: UsersByCityEntry[];
  unknownCount: number;
}

const usersByCityQuery = `
  query CmsUsersByCity {
    cmsUsersByCity {
      cities {
        city
        count
      }
      unknownCount
    }
  }
`;

export const getUsersByCity = async (): Promise<UsersByCityResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUsersByCity: UsersByCityResponse }>
  >("/", {
    query: usersByCityQuery,
  });

  return (
    response.data.data?.cmsUsersByCity ?? { cities: [], unknownCount: 0 }
  );
};
