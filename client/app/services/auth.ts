import { apiPost, apiGet } from "./api";
import { setToken, setCachedUser, clearSession } from "./sessionStore";
import { setLocalBalance } from "./offlineStore";

export async function loginUser(payload: { email: string; password: string }) {
  const res = await apiPost("/auth/login", payload);

  const token = res?.token || res?.accessToken;
  if (!token) throw new Error("Login did not return a token.");

  await setToken(token);

  // ✅ fetch real user + cache it
  const { user: me } = await apiGet("/auth/me");

  console.log("Onlogin", me);
  // {"status": "success", "user": {"__v": 0, "_id": "698f186666ddf36f106bb089", "balance": 850, "email": "joshan@gmail.com", "id": "698f186666ddf36f106bb089", "maxBalance": 1000, "name": "joshan"}}
  const userId = String(me?._id || me?.id || "unknown");
  const name = me.name;
  const email = me.email;

  await setCachedUser({ id: userId, name, email });

  // ✅ fetch wallet + cache balance locally for offline use
  const wallet = await apiGet("/wallet/me"); // { userId, balance, maxBalance }
  if (typeof wallet?.balance === "number") {
    await setLocalBalance(wallet.balance);
  } else {
    await setLocalBalance(0);
  }

  return { token, me, wallet };
}

export async function logoutUser() {
  await clearSession();
}
