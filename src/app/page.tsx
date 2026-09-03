export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-start justify-center gap-6 px-5 py-24 sm:px-10 lg:px-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Website Ordering Platform
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Order a website. Pay online. Track it to delivery.
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-muted">
        Foundation in progress. The public site, order flow, and dashboards are
        being built per BUILD_PLAN.md.
      </p>
    </main>
  );
}
