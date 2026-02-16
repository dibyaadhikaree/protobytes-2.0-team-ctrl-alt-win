import { getToken } from "./sessionStore";

import { API_BASE_URL as API_BASE } from "../config";

async function unwrap(res: Response, path: string) {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json?.message || json?.error || `Request failed (${res.status})`;
    throw new Error(`${path}: ${msg}`);
  }
  // ✅ handle { status, data }
  if (json && typeof json === "object" && "data" in json) return json.data;
  return json;
}

export async function apiGet(path: string) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return unwrap(res, `GET ${path}`);
}

export async function apiPost(path: string, body: any) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return unwrap(res, `POST ${path}`);
}
