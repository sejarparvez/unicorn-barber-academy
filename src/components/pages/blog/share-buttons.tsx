import {
	IconBrandFacebook,
	IconBrandLinkedin,
	IconBrandWhatsapp,
	IconBrandX,
	IconCheck,
	IconLink,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type ShareTarget = {
	label: string;
	icon: typeof IconLink;
	/** Builds the share URL from the page URL and article title. */
	href: (url: string, title: string) => string;
};

const TARGETS: ShareTarget[] = [
	{
		label: 'Share on X',
		icon: IconBrandX,
		href: (url, title) =>
			`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
	},
	{
		label: 'Share on Facebook',
		icon: IconBrandFacebook,
		href: (url) =>
			`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
	},
	{
		label: 'Share on LinkedIn',
		icon: IconBrandLinkedin,
		href: (url) =>
			`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
	},
	{
		label: 'Share on WhatsApp',
		icon: IconBrandWhatsapp,
		href: (url, title) =>
			`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
	},
];

const ICON_BUTTON =
	'inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60';

/**
 * Native share sheet where available, otherwise a row of network buttons plus
 * copy-link. The page URL is read on the client so the server render stays
 * stable and no absolute origin is hard-coded.
 */
export function ShareButtons({
	title,
	className,
}: {
	title: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) {
			return;
		}
		const timer = window.setTimeout(() => setCopied(false), 2000);
		return () => window.clearTimeout(timer);
	}, [copied]);

	const currentUrl = () =>
		typeof window === 'undefined' ? '' : window.location.href;

	const openShare = (target: ShareTarget) => {
		const url = currentUrl();
		if (!url) {
			return;
		}
		window.open(
			target.href(url, title),
			'_blank',
			'noopener,noreferrer,width=640,height=640',
		);
	};

	const copyLink = async () => {
		const url = currentUrl();
		if (!url) {
			return;
		}
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
		} catch {
			// Clipboard can be blocked (insecure context, denied permission).
		}
	};

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
				Share
			</span>
			{TARGETS.map((target) => (
				<button
					key={target.label}
					type="button"
					aria-label={target.label}
					onClick={() => openShare(target)}
					className={ICON_BUTTON}
				>
					<target.icon className="size-4" stroke={1.75} aria-hidden />
				</button>
			))}
			<button
				type="button"
				aria-label={copied ? 'Link copied' : 'Copy link'}
				onClick={copyLink}
				className={ICON_BUTTON}
			>
				{copied ? (
					<IconCheck className="size-4 text-primary" stroke={2} aria-hidden />
				) : (
					<IconLink className="size-4" stroke={1.75} aria-hidden />
				)}
			</button>
		</div>
	);
}
