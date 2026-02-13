import { apiFetch } from "./api";
import { getToken, clearToken } from "./storage";

export { getToken, clearToken };

export async function fetchMe() {
  const response = await apiFetch("/auth/me", { method: "GET" });

  // Handle both shapes safely
  return response.user || response.data;
}
