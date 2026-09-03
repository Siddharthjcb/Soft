import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Category, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeOrderTotal, isValidSelections } from "@/lib/pricing";
import { CATEGORIES } from "@/lib/categories";

interface CreateOrderBody {
  category: string;
  tier: number;
  deliveryPlan: string;
  addons: string[];
  requirementsText?: string;
  assets?: { url: string; fileName: string }[];
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: CreateOrderBody;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const categoryOk = CATEGORIES.some((c) => c.id === body.category);
  const selections = {
    tier: body.tier,
    deliveryPlan: body.deliveryPlan,
    addons: Array.isArray(body.addons) ? body.addons : [],
  };
  if (!categoryOk || !isValidSelections(selections)) {
    return NextResponse.json({ error: "Invalid selections" }, { status: 400 });
  }

  // Never trust a client-sent total — recompute from the catalog.
  const priceTotal = computeOrderTotal(selections);

  // Ensure the User row exists (first-login sync).
  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  let dbUserId = existing?.id;
  if (!dbUserId) {
    const cu = await currentUser();
    const email =
      cu?.primaryEmailAddress?.emailAddress ??
      cu?.emailAddresses?.[0]?.emailAddress ??
      `${userId}@placeholder.local`;
    const name =
      [cu?.firstName, cu?.lastName].filter(Boolean).join(" ") ||
      cu?.username ||
      null;
    const created = await prisma.user.create({
      data: { clerkId: userId, email, name },
    });
    dbUserId = created.id;
  }

  const assets = Array.isArray(body.assets) ? body.assets.slice(0, 20) : [];

  const order = await prisma.order.create({
    data: {
      userId: dbUserId,
      category: body.category as Category,
      tier: selections.tier,
      deliveryPlan: selections.deliveryPlan,
      addons: selections.addons,
      requirementsText: body.requirementsText?.slice(0, 5000) || null,
      status: OrderStatus.pending_payment,
      priceTotal,
      assets: {
        create: assets
          .filter((a) => a && typeof a.url === "string")
          .map((a) => ({
            fileUrl: a.url,
            fileName: (a.fileName || "file").slice(0, 200),
          })),
      },
    },
  });

  return NextResponse.json({ id: order.id, priceTotal });
}
