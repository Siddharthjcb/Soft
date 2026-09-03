import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SITE } from "@/lib/site";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      {/* Font variables are defined here but only consumed inside
          [data-surface="editorial"] — see globals.css. */}
      <html lang="en" className={`h-full antialiased ${fontVariables}`}>
        <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
