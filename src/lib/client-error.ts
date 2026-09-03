/**
 * Read the message out of the API error envelope: { error: { code, message } }.
 * Falls back gracefully if the body is not JSON or not shaped as expected.
 */
export async function apiErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await res.json()) as {
      error?: { message?: string } | string;
    } | null;
    const err = body?.error;
    if (typeof err === "string" && err) return err;
    if (err && typeof err === "object" && err.message) return err.message;
  } catch {
    /* body was not JSON */
  }
  return fallback;
}
