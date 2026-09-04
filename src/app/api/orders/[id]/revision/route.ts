import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, parseJson, parseParams, requireApiUser } from "@/lib/api";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { orderIdParams, revisionBody } from "@/lib/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await requireApiUser();
  if (!authed.ok) return authed.response;

  const limited = await enforceRateLimit({
    request,
    userId: authed.user.id,
    ...LIMITS.revision,
  });
  if (limited) return limited;

  const p = parseParams(orderIdParams, await params);
  if (!p.ok) return p.response;

  const parsed = await parseJson(revisionBody, request);
  if (!parsed.ok) return parsed.response;

  const order = await prisma.order.findUnique({ where: { id: p.data.id } });
  if (!order || order.userId !== authed.user.id) {
    return jsonError(404, "not_found", "Order not found.");
  }
  if (
    order.status !== OrderStatus.in_progress &&
    order.status !== OrderStatus.delivered
  ) {
    return jsonError(
      409,
      "not_revisable",
      "Revisions can be requested once work is in progress.",
    );
  }

  // Append to the history — never overwrite an earlier request.
  const [revision] = await prisma.$transaction([
    prisma.revisionRequest.create({
      data: { orderId: p.data.id, note: parsed.data.note },
    }),
    prisma.order.update({
      where: { id: p.data.id },
      data: { status: OrderStatus.revision_requested },
    }),
  ]);

  return NextResponse.json({ ok: true, id: revision.id });
}
