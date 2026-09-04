import { Resend } from "resend";
import { formatINR } from "@/lib/format";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = process.env.RESEND_FROM_EMAIL ?? "orders@example.com";
const ADMIN = process.env.ADMIN_EMAIL ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function sendOrderConfirmation(opts: {
  to: string;
  orderId: string;
  receiptNumber: string;
  totalPaise: number;
  pdf: Buffer;
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Your order ${opts.orderId} is confirmed`,
    text: [
      "Thanks — your payment is confirmed and your order is now in our queue.",
      "",
      `Order:    ${opts.orderId}`,
      `Receipt:  ${opts.receiptNumber}`,
      `Total:    ${formatINR(opts.totalPaise)}`,
      "",
      APP_URL
        ? `Track it here: ${APP_URL}/dashboard/orders/${opts.orderId}`
        : "You can track it from your dashboard.",
      "",
      "Your PDF receipt is attached.",
    ].join("\n"),
    attachments: [
      { filename: `receipt-${opts.receiptNumber}.pdf`, content: opts.pdf },
    ],
  });
}

export async function sendStatusUpdate(opts: {
  to: string;
  orderId: string;
  statusLabel: string;
  deliveredUrl?: string | null;
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Update on your order ${opts.orderId}`,
    text: [
      `Your order ${opts.orderId} is now: ${opts.statusLabel}.`,
      opts.deliveredUrl ? `\nYour site is live: ${opts.deliveredUrl}` : "",
      APP_URL ? `\nDetails: ${APP_URL}/dashboard/orders/${opts.orderId}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function sendAdminNewOrder(opts: {
  orderId: string;
  category: string;
  tier: number;
  totalPaise: number;
  customerEmail: string;
}): Promise<void> {
  if (!ADMIN) return;
  await resend.emails.send({
    from: FROM,
    to: ADMIN,
    subject: `New paid order: ${opts.orderId}`,
    text: [
      "A new order has been paid and is ready for fulfilment.",
      "",
      `Order:     ${opts.orderId}`,
      `Category:  ${opts.category}`,
      `Tier:      ${opts.tier}`,
      `Total:     ${formatINR(opts.totalPaise)}`,
      `Customer:  ${opts.customerEmail}`,
      "",
      APP_URL ? `${APP_URL}/admin/orders/${opts.orderId}` : "",
    ].join("\n"),
  });
}
