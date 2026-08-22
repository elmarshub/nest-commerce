import "server-only";
import { getAccessToken } from "./tokens";
import { refreshSession } from "./session";

function isExpired(accessToken: string): boolean {
  try {
    const payload = accessToken.split(".")[1];
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof exp !== "number") return false;
    // Refresh a little early so the request doesn't race the expiry.
    return Date.now() >= exp * 1000 - 10_000;
  } catch {
    return true;
  }
}

export async function requireAuthHeaders(
  errorMessage = "Please sign in to continue",
): Promise<
  | { headers: { Authorization: string }; error: null }
  | { headers: null; error: string }
> {
  let accessToken = await getAccessToken();

  if (!accessToken || isExpired(accessToken)) {
    accessToken = await refreshSession();
  }

  if (!accessToken) return { headers: null, error: errorMessage };
  return { headers: { Authorization: `Bearer ${accessToken}` }, error: null };
}
