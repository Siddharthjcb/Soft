import Link from "next/link";
import { PageMessage } from "@/components/ui/feedback";

export default function NotFound() {
  return (
    <PageMessage eyebrow="404" title="Page not found">
      <p className="max-w-md text-base leading-relaxed text-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-ink underline underline-offset-4"
      >
        Back to home
      </Link>
    </PageMessage>
  );
}
