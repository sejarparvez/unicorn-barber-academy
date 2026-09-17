// routes/dashboard/gallery.tsx
// Gallery management. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { GalleryAdminPage } from "@/features/admin/gallery-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/gallery")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	head: () => ({
		meta: [
			{ title: "Gallery | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: GalleryAdminPage,
});
