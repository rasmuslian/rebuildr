import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { refreshToken } from "@/actions/auth";
import { fetchSession } from "@lib/session";

interface GraphQLError {
  message: string;
  extensions?: { code?: string };
}

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await fetchSession();
    const accessToken = session.accessToken;

    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
);

apiClient.interceptors.response.use(
  async (response: AxiosResponse<GraphQLResponse>) => {
    const originalRequest = response.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const errors = response.data.errors;
    const isUnauthenticated = errors?.some(
      (err) => err.extensions?.code === "UNAUTHENTICATED",
    );

    if (
      isUnauthenticated &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;
      try {
        const { success, accessToken } = await refreshToken();

        if (success && originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (error) {
        console.error("Failed to refresh token: ", error);
        return Promise.reject(error);
      }
    }

    return response;
  },
);

export default apiClient;
