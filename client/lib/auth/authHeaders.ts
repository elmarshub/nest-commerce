import "server-only";
import { getAccessToken } from "./tokens";

export async function requireAuthHeaders(
  errorMessage = "Please sign in to continue",
): Promise<
  | { headers: { Authorization: string }; error: null }
  | { headers: null; error: string }
> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { headers: null, error: errorMessage };
  return { headers: { Authorization: `Bearer ${accessToken}` }, error: null };
}
