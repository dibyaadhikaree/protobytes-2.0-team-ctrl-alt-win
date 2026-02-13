import { API_BASE_URL } from "../config";
import { getToken } from "./storage";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok)
    throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}
