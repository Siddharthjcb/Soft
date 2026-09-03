import { NextResponse } from "next/server";
import { Category, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeOrderTotal } from "@/lib/pricing";
import { jsonError, parseJson, requireApiUser } from "@/lib/api";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { createOrderBody } from "@/lib/schemas";

export async function POST(request: Request) {
  const authed = await requireApiUser();
  if (!authed.ok) return authed.response;

  const limited = await enforceRateLimit({
    request,
    userId: authed.user.id,
    ...LIMITS.createOrder,
  });
  if (limited) return limited;

  const parsed = await parseJson(createOrderBody, request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  // Same key => same order. Protects against a double-submitted form.
  if (body.idempotencyKey) {
    const existing = await prisma.order.findUnique({
      where: { idempotencyKey: body.idempotencyKey },
    });
    if (existing) {
      if (existing.userId !== authed.user.id) {
        return jsonError(409, "key_conflict", "That request key is already in use.");
      }
      return NextResponse.json({
        id: existing.id,
        priceTotal: existing.priceTotal,
        deduplicated: true,
      });
    }
  }

  // Never trust a client-sent total — recompute from the catalog.
  const priceTotal = computeOrderTotal({
    tier: body.tier,
    deliveryPlan: body.deliveryPlan,
    addons: body.addons,
  });
  if (priceTotal <= 0) {
    return jsonError(400, "invalid_selections", "Could not price that order.");
  }

  const order = await prisma.order.create({
    data: {
      idempotencyKey: body.idempotencyKey ?? null,
      userId: authed.user.id,
      category: body.category as Category,
      tier: body.tier,
      deliveryPlan: body.deliveryPlan,
      addons: body.addons,
      requirementsText: body.requirementsText?.trim() || null,
      status: OrderStatus.pending_payment,
      priceTotal,
      assets: {
        create: body.assets.map((a) => ({
          fileUrl: a.url,
          fileName: a.fileName,
        })),
      },
    },
  });

  return NextResponse.json({ id: order.id, priceTotal });
}
