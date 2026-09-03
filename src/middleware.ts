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
  matcher: [
    // Run on everything except Next internals and static files...
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // ...and always on API routes.
    "/(api|trpc)(.*)",
  ],
};
