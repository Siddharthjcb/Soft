import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-10 lg:px-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Dashboard
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Signed in as {user.email}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Your orders and their status will appear here (task 4.1).
      </p>
    </main>
  );
}
