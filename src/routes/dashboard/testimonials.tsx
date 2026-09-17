// routes/dashboard/testimonials.tsx
// Testimonial management. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { TestimonialsPage } from "@/features/admin/testimonials-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/testimonials")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	head: () => ({
		meta: [
			{ title: "Testimonials | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: TestimonialsPage,
});
