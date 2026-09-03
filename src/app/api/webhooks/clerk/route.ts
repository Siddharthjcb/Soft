import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ClerkEmail = { id: string; email_address: string };
type ClerkUserData = {
  id: string;
  email_addresses?: ClerkEmail[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  public_metadata?: { role?: string } | null;
};
type ClerkEvent =
  | { type: "user.created" | "user.updated"; data: ClerkUserData }
  | { type: "user.deleted"; data: { id: string } }
  | { type: string; data: Record<string, unknown> };

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const payload = await req.text();
  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTimestamp = h.get("svix-timestamp");
  const svixSignature = h.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  let evt: ClerkEvent;
  try {
    evt = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as unknown as ClerkEvent;
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.deleted") {
    const id = (evt.data as { id?: string }).id;
    if (id) await prisma.user.deleteMany({ where: { clerkId: id } });
    return NextResponse.json({ ok: true });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const d = evt.data as ClerkUserData;
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

  return NextResponse.json({ ok: true, ignored: evt.type });
}
