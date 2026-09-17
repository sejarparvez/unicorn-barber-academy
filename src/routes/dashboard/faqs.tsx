// routes/dashboard/faqs.tsx
// FAQ management for home + contact placements. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { FaqsPage } from "@/features/admin/faqs-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/faqs")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	head: () => ({
		meta: [
			{ title: "FAQs | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: FaqsPage,
});
