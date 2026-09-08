import { graph, type JsonLdValue } from "@/lib/seo/schema";

/**
 * Renders a page's structured data as one `@graph`. The JSON is built on the
 * server from our own data — never from user input — which is what makes
 * `dangerouslySetInnerHTML` safe here.
 */
export function JsonLd({ schema }: { schema: JsonLdValue[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: graph(...schema) }} />
  );
}
