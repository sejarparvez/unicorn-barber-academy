// routes/dashboard/testimonials.tsx
// Testimonial management. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { TestimonialsPage } from "@/features/admin/testimonials-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/testimonials")({
	beforeLoad: async ({ location }) => ({
		session: await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		}),
	}),
	head: () => ({
		meta: [
			{ title: "Testimonials | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: TestimonialsPage,
});
