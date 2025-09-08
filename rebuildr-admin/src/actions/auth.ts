import { LoginSchemaType } from "@/schema/login-schema";

export const logout = async () => {
  return await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};

export const login = async (formData: LoginSchemaType) => {
  return await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
};

export const refresh = async () => {
  return await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};
