// src/components/layout/announcement-banner.tsx
// Academy-wide announcement strip above the header, controlled from the
// dashboard Site page. Server-rendered (crawlers see it); dismissible
// per-session via localStorage. Renders nothing when no announcement set.

import { IconX } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSite } from "@/lib/site-context";

const DISMISS_KEY = "ubt-announcement-dismissed";

export function AnnouncementBanner() {
	const { announcement } = useSite();
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		try {
			if (sessionStorage.getItem(DISMISS_KEY) === announcement?.text) {
				setDismissed(true);
			}
		} catch {
			// Private mode etc. — banner simply stays visible.
		}
	}, [announcement?.text]);

	if (!announcement || dismissed) return null;

	const dismiss = () => {
		setDismissed(true);
		try {
			sessionStorage.setItem(DISMISS_KEY, announcement.text);
		} catch {
			// Ignore storage failures.
		}
	};

	const body = (
		<>
			<span className="truncate">{announcement.text}</span>
			<button
				type="button"
				onClick={dismiss}
				aria-label="Dismiss announcement"
				className="shrink-0 rounded-full p-1 transition hover:bg-primary-foreground/20"
			>
				<IconX className="h-3.5 w-3.5" stroke={2} />
			</button>
		</>
	);

	return (
		<div className="bg-primary text-primary-foreground">
			<div className="mx-auto flex max-w-8xl items-center justify-center gap-3 px-4 py-2 text-center text-[13px] font-medium sm:px-6 lg:px-16">
				{announcement.to ? (
					announcement.to.startsWith("http") ? (
						<a
							href={announcement.to}
							target="_blank"
							rel="noreferrer"
							className="flex min-w-0 flex-1 items-center justify-center gap-3 hover:underline"
						>
							{body}
						</a>
					) : (
						<Link
							to={announcement.to}
							className="flex min-w-0 flex-1 items-center justify-center gap-3 hover:underline"
						>
							{body}
						</Link>
					)
				) : (
					<div className="flex min-w-0 flex-1 items-center justify-center gap-3">
						{body}
					</div>
				)}
			</div>
		</div>
	);
}
