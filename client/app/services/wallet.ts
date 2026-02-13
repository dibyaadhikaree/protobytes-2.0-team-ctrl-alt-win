import { apiFetch } from "./api";

export async function fetchWalletMe() {
  // create this endpoint later: GET /wallet/me
  return apiFetch("/wallet/me", { method: "GET" });
}
