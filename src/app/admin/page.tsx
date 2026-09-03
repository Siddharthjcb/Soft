export const metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-10 lg:px-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Admin
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Operations</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        The order queue and fulfilment tools are built in task 5.1.
      </p>
    </main>
  );
}
