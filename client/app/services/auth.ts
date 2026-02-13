import { apiFetch } from "./api";
import { setToken, clearToken } from "./storage";
import { clearCachedWallet } from "./walletCache";

export async function registerUser(payload: any) {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...payload, passwordConfirm: payload.password }),
  });

  if (res?.token) await setToken(res.token);
  return res.data;
}

export async function loginUser(payload: any) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res?.token) await setToken(res.token);
  return res.data;
}

export async function logoutUser() {
  await clearToken();
  await clearCachedWallet();
}
