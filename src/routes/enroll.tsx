// routes/enroll.tsx
// Application page. Sign-in required: anonymous visitors bounce to
// /auth/signin?redirect=/enroll (requireRoles preserves the destination).
import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { EnrollPage } from "@/features/enrollment/enroll-page";
import { listOpenIntakesFn } from "@/server/enrollment-fns";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/enroll")({
	beforeLoad: async ({ location }) => {
		const session = await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
		});
		return { session };
	},
	loader: () => listOpenIntakesFn(),
	head: () => ({
		meta: [
			{ title: "Enroll | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Apply to Unicorn Barber Training Academy — hands-on programs in barbering and beauty & cosmetology in Dhaka.",
			},
			{
				property: "og:title",
				content: "Enroll | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Apply to Unicorn Barber Training Academy — hands-on programs in barbering and beauty & cosmetology.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/enroll` },
			{ property: "og:image", content: `${SITE_URL}/banner.png` },
			{ name: "robots", content: "noindex" },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/enroll` }],
	}),
	component: EnrollRoute,
});

function EnrollRoute() {
	const intakes = Route.useLoaderData();
	const { session } = Route.useRouteContext();
	return <EnrollPage intakes={intakes} session={session} />;
}
