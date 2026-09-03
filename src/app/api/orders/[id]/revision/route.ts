import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();

  let body: { note?: string };
  try {
    body = (await request.json()) as { note?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const note = (body.note ?? "").trim();
  if (note.length < 5) {
    return NextResponse.json({ error: "Note is too short" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (
    order.status !== OrderStatus.in_progress &&
    order.status !== OrderStatus.delivered
  ) {
    return NextResponse.json(
      { error: "Revisions can be requested once work is in progress." },
      { status: 409 },
    );
  }

  await prisma.order.update({
    where: { id },
    data: {
      status: OrderStatus.revision_requested,
      revisionNote: note.slice(0, 2000),
    },
  });

  return NextResponse.json({ ok: true });
}
