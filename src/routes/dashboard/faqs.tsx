// routes/dashboard/faqs.tsx
// FAQ management for home + contact placements. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { FaqsPage } from "@/features/admin/faqs-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/faqs")({
	beforeLoad: async ({ location }) => ({
		session: await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		}),
	}),
	head: () => ({
		meta: [
			{ title: "FAQs | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: FaqsPage,
});
