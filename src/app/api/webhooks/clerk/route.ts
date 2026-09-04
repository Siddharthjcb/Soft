import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api";
import { claimWebhookEvent, isStaleEvent } from "@/lib/webhook";
import { clerkEventBody, clerkUserData } from "@/lib/schemas";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return jsonError(
      500,
      "not_configured",
      "CLERK_WEBHOOK_SECRET is not configured.",
    );
  }

  const payload = await req.text();
  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTimestamp = h.get("svix-timestamp");
  const svixSignature = h.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return jsonError(400, "missing_headers", "Missing svix headers.");
  }

  // svix enforces its own tolerance during verify(); this is a second gate.
  if (isStaleEvent(svixTimestamp)) {
    return jsonError(400, "stale_event", "Event timestamp is outside the window.");
  }

  let verified: unknown;
  try {
    verified = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return jsonError(400, "invalid_signature", "Signature verification failed.");
  }

  const event = clerkEventBody.safeParse(verified);
  if (!event.success) {
    return jsonError(400, "invalid_event", "Unrecognised event payload.");
  }

  // Claim the event id so a retry or replay is a no-op.
  if (!(await claimWebhookEvent("clerk", svixId))) {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  if (event.data.type === "user.deleted") {
    const id = event.data.data.id;
    if (id) await prisma.user.deleteMany({ where: { clerkId: id } });
    return NextResponse.json({ ok: true });
  }

  if (event.data.type === "user.created" || event.data.type === "user.updated") {
    const parsed = clerkUserData.safeParse(event.data.data);
    if (!parsed.success) {
      return jsonError(400, "invalid_event", "Unrecognised user payload.");
    }
    const d = parsed.data;

    const primary =
      d.email_addresses?.find((e) => e.id === d.primary_email_address_id) ??
      d.email_addresses?.[0];
    const email = primary?.email_address ?? `${d.id}@placeholder.local`;
    const name =
      [d.first_name, d.last_name].filter(Boolean).join(" ") || d.username || null;
    const role = d.public_metadata?.role === "admin" ? Role.admin : Role.customer;

    await prisma.user.upsert({
      where: { clerkId: d.id },
      update: { email, name, role },
      create: { clerkId: d.id, email, name, role },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: event.data.type });
}
