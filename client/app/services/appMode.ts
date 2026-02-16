import { getToken, getCachedUser } from "./sessionStore";

export type AppMode = "ONLINE" | "OFFLINE_READY" | "LOCKED";

export async function computeAppMode(isOnline: boolean): Promise<AppMode> {
  const token = await getToken();
  const user = await getCachedUser();

  // must have session to be usable offline
  const hasSession = !!token && !!user;

  if (isOnline && token) return "ONLINE"; // login can be validated later
  if (!isOnline && hasSession) return "OFFLINE_READY";
  return "LOCKED";
}
