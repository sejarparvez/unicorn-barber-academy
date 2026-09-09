// routes/dashboard/gallery.tsx
// Gallery management. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { GalleryAdminPage } from "@/features/admin/gallery-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/gallery")({
	beforeLoad: async ({ location }) => ({
		session: await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		}),
	}),
	head: () => ({
		meta: [
			{ title: "Gallery | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: GalleryAdminPage,
});
