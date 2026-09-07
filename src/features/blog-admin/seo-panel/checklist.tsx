// src/features/blog-admin/seo-panel/checklist.tsx
// Live SEO optimization checklist with pass/warn/fail indicators.
import { IconCheck, IconX } from "@tabler/icons-react";
import type { SeoCheck } from "@/lib/blog";
import { cn } from "@/lib/utils";

const LEVEL_STYLE: Record<SeoCheck["level"], string> = {
	good: "text-emerald-600 dark:text-emerald-400",
	warn: "text-amber-600 dark:text-amber-400",
	bad: "text-destructive",
};

export function Checklist({ checks }: { checks: SeoCheck[] }) {
	return (
		<section className="rounded-lg border border-border bg-muted/30 p-4">
			<h3 className="font-heading text-sm font-semibold">
				Optimization checklist
			</h3>
			<ul className="mt-3 space-y-1.5">
				{checks.map((check) => (
					<li
						key={check.label}
						className={cn(
							"flex items-start gap-2 text-xs",
							LEVEL_STYLE[check.level],
						)}
					>
						{check.level === "good" ? (
							<IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
						) : check.level === "warn" ? (
							<span className="mt-0.5 shrink-0 font-bold">!</span>
						) : (
							<IconX className="mt-0.5 h-3.5 w-3.5 shrink-0" />
						)}
						{check.label}
					</li>
				))}
			</ul>
		</section>
	);
}
