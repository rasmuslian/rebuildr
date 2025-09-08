"use client";

import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getCookie } from "cookies-next";
import { refresh } from "@/actions/auth";

interface GraphQLError {
  message: string;
  extensions?: { code?: string };
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getCookie("accessToken");

  if (accessToken && config.headers) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  async (response: AxiosResponse<GraphQLResponse>) => {
    const originalRequest = response.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const errors = response.data.errors;
    const isUnauthenticated = errors?.some(
      (err) => err.extensions?.code === "UNAUTHENTICATED",
    );

    if (isUnauthenticated && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await refresh();
        const { success, newAccessToken } = await refreshResponse.json();

        if (success && originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
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
