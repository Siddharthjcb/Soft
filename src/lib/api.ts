import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Role, type User } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";

/** Every API error uses this shape. */
export interface ApiErrorBody {
  error: { code: string; message: string };
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  init?: ResponseInit,
): NextResponse<ApiErrorBody> {
  return NextResponse.json<ApiErrorBody>(
    { error: { code, message } },
    { ...init, status },
  );
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
    .join("; ");
}

export type Parsed<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse<ApiErrorBody> };

/** Parse and validate a JSON request body. */
export async function parseJson<T>(
  schema: z.ZodType<T>,
  request: Request,
): Promise<Parsed<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: jsonError(
        400,
        "invalid_json",
        "Request body is not valid JSON.",
      ),
    };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      response: jsonError(400, "invalid_body", formatIssues(result.error)),
    };
  }
  return { ok: true, data: result.data };
}

/** Validate resolved route params. */
export function parseParams<T>(schema: z.ZodType<T>, params: unknown): Parsed<T> {
  const result = schema.safeParse(params);
  if (!result.success) {
    return {
      ok: false,
      response: jsonError(400, "invalid_params", formatIssues(result.error)),
    };
  }
  return { ok: true, data: result.data };
}

export type Authed =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse<ApiErrorBody> };

/**
 * API-route equivalent of getCurrentUser(): returns 401 JSON instead of
 * redirecting to /sign-in (a redirect would hand a fetch() caller HTML).
 * Creates the User row on first login, same as the page helper.
 */
export async function requireApiUser(): Promise<Authed> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      response: jsonError(401, "unauthenticated", "Sign in to continue."),
    };
  }

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return { ok: true, user: existing };

  const cu = await currentUser();
  const email =
    cu?.primaryEmailAddress?.emailAddress ??
    cu?.emailAddresses?.[0]?.emailAddress ??
    `${userId}@placeholder.local`;
  const name =
    [cu?.firstName, cu?.lastName].filter(Boolean).join(" ") ||
    cu?.username ||
    null;

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { email, name },
    create: { clerkId: userId, email, name },
  });
  return { ok: true, user };
}

/** Same, but 403s non-admins instead of redirecting to /dashboard. */
export async function requireApiAdmin(): Promise<Authed> {
  const result = await requireApiUser();
  if (!result.ok) return result;
  if (result.user.role !== Role.admin) {
    return {
      ok: false,
      response: jsonError(403, "forbidden", "Admin access required."),
    };
  }
  return result;
}
