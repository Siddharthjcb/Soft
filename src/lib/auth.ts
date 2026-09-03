import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Role, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * The app User row for the signed-in Clerk user, created on first login
 * (the "sync on first login" path; the Clerk webhook at
 * /api/webhooks/clerk keeps it in sync afterwards).
 * Redirects to /sign-in when there is no session.
 */
export async function getCurrentUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const cu = await currentUser();
  const email =
    cu?.primaryEmailAddress?.emailAddress ??
    cu?.emailAddresses?.[0]?.emailAddress ??
    `${userId}@placeholder.local`;
  const name =
    [cu?.firstName, cu?.lastName].filter(Boolean).join(" ") || cu?.username || null;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: { email, name },
    create: { clerkId: userId, email, name },
  });
}

/** Same as getCurrentUser, but sends non-admins to /dashboard. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (user.role !== Role.admin) redirect("/dashboard");
  return user;
}
