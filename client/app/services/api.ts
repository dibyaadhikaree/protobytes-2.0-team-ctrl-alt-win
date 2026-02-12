import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  const text = await res.text();
  let data: any = text;
  try {
    data = JSON.parse(text);
  } catch {}

  if (!res.ok)
    throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}
