import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@clerk/nextjs/server";
import { jsonError, requireApiUser } from "@/lib/api";

/**
 * Client-upload token endpoint for order assets (Vercel Blob).
 * The browser calls @vercel/blob/client `upload()` which posts here for a
 * short-lived token, then uploads straight to Blob storage.
 * Requires BLOB_READ_WRITE_TOKEN in the environment.
 *
 * The body is Vercel's own envelope and is handed to handleUpload as-is —
 * we only check it is a JSON object and let the SDK validate its shape.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const authed = await requireApiUser();
  if (!authed.ok) return authed.response;

  let body: HandleUploadBody;
  try {
    const raw: unknown = await request.json();
    if (typeof raw !== "object" || raw === null) {
      return jsonError(400, "invalid_body", "Expected a JSON object.");
    }
    body = raw as HandleUploadBody;
  } catch {
    return jsonError(400, "invalid_json", "Request body is not valid JSON.");
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const { userId } = await auth();
        if (!userId) throw new Error("Not signed in");
        return {
          allowedContentTypes: [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/svg+xml",
            "application/pdf",
            "application/zip",
            "text/plain",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024,
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: async () => {
        // Assets are linked to the Order when the order is created.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return jsonError(
      400,
      "upload_failed",
      error instanceof Error ? error.message : "Upload failed.",
    );
  }
}
