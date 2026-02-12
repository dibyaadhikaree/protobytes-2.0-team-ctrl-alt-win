import * as SecureStore from "expo-secure-store";
import { apiFetch } from "./api";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      passwordConfirm: payload.password, // if backend requires it
    }),
  });

  if (data.token) await SecureStore.setItemAsync("token", data.token);
  return data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (data.token) await SecureStore.setItemAsync("token", data.token);
  return data;
}

export async function logoutUser() {
  await SecureStore.deleteItemAsync("token");
}
