import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Both areas require a signed-in user.
  if (isDashboardRoute(req) || isAdminRoute(req)) {
    await auth.protect();
  }

  // Best-effort admin gate at the edge. The authoritative check is the DB role
  // lookup in src/app/admin/layout.tsx (role lives on the User model per
  // CLAUDE.md). This claim is only present if you enable it in the Clerk
  // session-token config; when it is missing we fall through to the layout.
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    const claims = sessionClaims as
      | { metadata?: { role?: string }; publicMetadata?: { role?: string } }
      | null;
    const role = claims?.metadata?.role ?? claims?.publicMetadata?.role;
    if (role && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  // Only the routes that actually need auth. Deliberately NOT a catch-all:
  // clerkMiddleware performs a dev-browser handshake on browser navigations
  // when using pk_test_ keys, which redirects to the Clerk frontend domain.
  // Running that on "/", "/pricing" and "/portfolio" bought us nothing, made
  // static pages uncacheable, and meant a misconfigured Clerk key took the
  // whole public site down in a browser. These pages never call auth().
  //
  // /order/:path* is included because /order/new calls auth() to decide
  // whether to show the sign-in gate — auth() throws without the middleware.
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/order/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/api/:path*",
  ],
};
