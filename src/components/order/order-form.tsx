"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import {
  TIERS,
  DELIVERY_OPTIONS,
  ADDONS,
  computeOrderTotal,
  type TierId,
  type DeliveryPlanId,
  type AddonId,
} from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { apiErrorMessage } from "@/lib/client-error";

const DRAFT_KEY = "order-draft-v1";
const TOTAL_STEPS = 5;

interface Asset {
  url: string;
  fileName: string;
}

interface Draft {
  step: number;
  category: CategoryId | null;
  tier: TierId | null;
  deliveryPlan: DeliveryPlanId;
  addons: AddonId[];
  requirements: string;
  assets: Asset[];
  /** generated on first submit; reused on retry so a resubmit is a no-op */
  idempotencyKey: string | null;
}

const EMPTY: Draft = {
  step: 1,
  category: null,
  tier: null,
  deliveryPlan: "standard_1_week",
  addons: [],
  requirements: "",
  assets: [],
  idempotencyKey: null,
};

function loadDraft(): Draft {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) };
  } catch {
    return EMPTY;
  }
}

export function OrderForm({ isSignedIn }: { isSignedIn: boolean }) {
  const router = useRouter();
  // Lazy init reads sessionStorage on the client's first render (returns EMPTY
  // during SSR where there is no window). Render is gated on `hydrated` below
  // so the server and first client render agree.
  const [draft, setDraft] = useState<Draft>(() => loadDraft());
  const [hydrated, setHydrated] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // One-time mount latch so the gated render can switch to the real form.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore quota / private-mode errors
    }
  }, [draft, hydrated]);

  const patch = useCallback(
    (next: Partial<Draft>) => setDraft((d) => ({ ...d, ...next })),
    [],
  );

  const total =
    draft.tier !== null
      ? computeOrderTotal({
          tier: draft.tier,
          deliveryPlan: draft.deliveryPlan,
          addons: draft.addons,
        })
      : 0;

  const canAdvance =
    (draft.step === 1 && draft.category !== null) ||
    (draft.step === 2 && draft.tier !== null) ||
    draft.step === 3 ||
    draft.step === 4;

  function goBack() {
    setError(null);
    patch({ step: Math.max(1, draft.step - 1) });
  }

  function goNext() {
    setError(null);
    // Login gate before the review step. Persist synchronously (the effect
    // hasn't run yet) so the draft survives the round-trip through Clerk.
    if (draft.step === 4 && !isSignedIn) {
      const withStep = { ...draft, step: 5 };
      try {
        window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(withStep));
      } catch {
        /* ignore */
      }
      router.push("/sign-in?redirect_url=%2Forder%2Fnew");
      return;
    }
    patch({ step: Math.min(TOTAL_STEPS, draft.step + 1) });
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: Asset[] = [];
      for (const file of Array.from(fileList)) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        uploaded.push({ url: blob.url, fileName: file.name });
      }
      patch({ assets: [...draft.assets, ...uploaded].slice(0, 20) });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "File upload failed. Try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  function removeAsset(url: string) {
    patch({ assets: draft.assets.filter((a) => a.url !== url) });
  }

  async function confirm() {
    setError(null);
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=%2Forder%2Fnew");
      return;
    }
    if (draft.category === null || draft.tier === null) {
      patch({ step: 1 });
      return;
    }
    // Reuse the key across retries so a resubmit returns the same order.
    let idempotencyKey = draft.idempotencyKey;
    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
      const next = { ...draft, idempotencyKey };
      try {
        window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      setDraft(next);
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          category: draft.category,
          tier: draft.tier,
          deliveryPlan: draft.deliveryPlan,
          addons: draft.addons,
          requirementsText: draft.requirements,
          assets: draft.assets,
        }),
      });
      if (res.status === 401) {
        router.push("/sign-in?redirect_url=%2Forder%2Fnew");
        return;
      }
      if (!res.ok) {
        throw new Error(
          await apiErrorMessage(res, "Could not create the order."),
        );
      }
      const { id } = (await res.json()) as { id: string };
      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push(`/order/${id}/pay`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="h-64 rounded-xl border border-border bg-surface" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Step {draft.step} of {TOTAL_STEPS}
        </p>
        {draft.tier !== null && draft.step >= 3 && (
          <p className="font-mono text-sm text-ink">
            Running total: {formatINR(total)}
          </p>
        )}
      </div>

      {draft.step === 1 && (
        <Fieldset legend="Pick a category">
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <SelectCard
                key={c.id}
                selected={draft.category === c.id}
                onClick={() => patch({ category: c.id })}
                title={c.name}
                meta={c.audience}
                body={c.blurb}
              />
            ))}
          </div>
        </Fieldset>
      )}

      {draft.step === 2 && (
        <Fieldset legend="Pick a tier">
          <div className="grid gap-3 sm:grid-cols-2">
            {TIERS.map((t) => (
              <SelectCard
                key={t.id}
                selected={draft.tier === t.id}
                onClick={() => patch({ tier: t.id })}
                title={t.name}
                meta={`${t.priceIsFrom ? "from " : ""}${formatINR(t.pricePaise)}`}
                body={t.tagline}
              />
            ))}
          </div>
        </Fieldset>
      )}

      {draft.step === 3 && (
        <div className="flex flex-col gap-8">
          <Fieldset legend="Delivery speed">
            <div className="grid gap-3 sm:grid-cols-2">
              {DELIVERY_OPTIONS.map((d) => (
                <SelectCard
                  key={d.id}
                  selected={draft.deliveryPlan === d.id}
                  onClick={() => patch({ deliveryPlan: d.id })}
                  title={d.name}
                  meta={
                    d.surchargePaise === 0
                      ? "Included"
                      : `+ ${formatINR(d.surchargePaise)}`
                  }
                  body={d.note}
                />
              ))}
            </div>
          </Fieldset>

          <Fieldset legend="Add-ons (optional)">
            <div className="grid gap-3 sm:grid-cols-2">
              {ADDONS.map((a) => {
                const on = draft.addons.includes(a.id);
                return (
                  <SelectCard
                    key={a.id}
                    selected={on}
                    onClick={() =>
                      patch({
                        addons: on
                          ? draft.addons.filter((x) => x !== a.id)
                          : [...draft.addons, a.id],
                      })
                    }
                    title={a.name}
                    meta={`from ${formatINR(a.fromPaise)}`}
                    body={a.note}
                  />
                );
              })}
            </div>
          </Fieldset>
        </div>
      )}

      {draft.step === 4 && (
        <div className="flex flex-col gap-8">
          <Fieldset legend="What do you need?">
            <label
              htmlFor="requirements"
              className="font-mono text-xs uppercase tracking-widest text-muted"
            >
              Describe the site or system
            </label>
            <textarea
              id="requirements"
              value={draft.requirements}
              onChange={(e) => patch({ requirements: e.target.value })}
              rows={7}
              maxLength={5000}
              placeholder="Pages, features, content you already have, examples you like."
              className="w-full rounded-lg border border-border bg-transparent p-4 text-sm leading-relaxed text-ink outline-none focus:ring-2 focus:ring-ink"
            />
          </Fieldset>

          <Fieldset legend="Reference files (optional)">
            <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-ink hover:bg-faint">
              {uploading ? "Uploading…" : "Add files"}
              <input
                type="file"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  void handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {draft.assets.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {draft.assets.map((a) => (
                  <li
                    key={a.url}
                    className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span className="truncate text-muted">{a.fileName}</span>
                    <button
                      type="button"
                      onClick={() => removeAsset(a.url)}
                      className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Fieldset>
        </div>
      )}

      {draft.step === 5 && (
        <Fieldset legend="Review and confirm">
          <dl className="flex flex-col divide-y divide-border rounded-xl border border-border">
            <Row label="Category" value={categoryName(draft.category)} />
            <Row label="Tier" value={tierName(draft.tier)} />
            <Row label="Delivery" value={deliveryName(draft.deliveryPlan)} />
            <Row
              label="Add-ons"
              value={
                draft.addons.length
                  ? draft.addons.map(addonName).join(", ")
                  : "None"
              }
            />
            <Row
              label="Requirements"
              value={draft.requirements.trim() || "—"}
            />
            <Row
              label="Files"
              value={
                draft.assets.length
                  ? `${draft.assets.length} attached`
                  : "None"
              }
            />
            <Row label="Estimated total" value={formatINR(total)} strong />
          </dl>
          <p className="mt-3 text-sm text-muted">
            Amounts marked &ldquo;from&rdquo; (Tier 4, add-ons) are baselines.
            We confirm the final price with you before any work starts.
          </p>
        </Fieldset>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        {draft.step > 1 && (
          <Button variant="secondary" onClick={goBack} disabled={submitting}>
            Back
          </Button>
        )}
        {draft.step < TOTAL_STEPS && (
          <Button onClick={goNext} disabled={!canAdvance || uploading}>
            Continue
          </Button>
        )}
        {draft.step === TOTAL_STEPS && (
          <Button onClick={() => void confirm()} disabled={submitting}>
            {submitting ? "Creating order…" : "Confirm and continue to payment"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-xl font-semibold tracking-tight">{legend}</legend>
      {children}
    </fieldset>
  );
}

function SelectCard({
  selected,
  onClick,
  title,
  meta,
  body,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  meta: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col gap-2 rounded-xl border p-5 text-left transition-colors ${
        selected
          ? "border-ink bg-faint"
          : "border-border bg-surface hover:border-ink"
      }`}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-base font-medium text-ink">{title}</span>
        <span className="font-mono text-xs text-muted">{meta}</span>
      </span>
      <span className="text-sm leading-relaxed text-muted">{body}</span>
    </button>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3">
      <dt className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd
        className={`max-w-[60%] text-right text-sm ${
          strong ? "font-mono font-semibold text-ink" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function categoryName(id: CategoryId | null) {
  return CATEGORIES.find((c) => c.id === id)?.name ?? "—";
}
function tierName(id: TierId | null) {
  const t = TIERS.find((x) => x.id === id);
  return t ? `${t.name} — ${t.tagline}` : "—";
}
function deliveryName(id: DeliveryPlanId) {
  return DELIVERY_OPTIONS.find((d) => d.id === id)?.name ?? "—";
}
function addonName(id: AddonId) {
  return ADDONS.find((a) => a.id === id)?.name ?? id;
}
