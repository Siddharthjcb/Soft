import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Website Ordering Platform",
    template: "%s · Website Ordering Platform",
  },
  description:
    "Order a website or system for your business, pay online, and track it through to delivery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
