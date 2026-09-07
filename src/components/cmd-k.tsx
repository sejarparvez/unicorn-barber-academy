// src/components/cmd-k.tsx
// Lightweight command palette triggered by Cmd+K / Ctrl+K. Lists admin
// navigation links with keyboard navigation and fuzzy filtering.
import {
	IconArticle,
	IconBook2,
	IconCategory,
	IconClipboardList,
	IconLayoutDashboard,
	IconSettings,
	IconUserPlus,
} from "@tabler/icons-react";
import { useMatchRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CmdItem = {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
};

const ITEMS: CmdItem[] = [
	{ label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
	{ label: "Blog Posts", href: "/dashboard/blog", icon: IconArticle },
	{ label: "New Post", href: "/dashboard/blog/new", icon: IconArticle },
	{
		label: "Categories",
		href: "/dashboard/blog/categories",
		icon: IconCategory,
	},
	{
		label: "Applications",
		href: "/dashboard/enrollments",
		icon: IconClipboardList,
	},
	{
		label: "Intakes",
		href: "/dashboard/enrollments/intakes",
		icon: IconUserPlus,
	},
	{ label: "Certificates", href: "/dashboard/certificates", icon: IconBook2 },
	{ label: "Settings", href: "/dashboard/settings", icon: IconSettings },
];

export function CmdK() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const navigate = useNavigate();
	const matchRoute = useMatchRoute();
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const filtered = useMemo(() => {
		if (!query.trim()) return ITEMS;
		const q = query.toLowerCase();
		return ITEMS.filter((item) => item.label.toLowerCase().includes(q));
	}, [query]);

	// Reset active index when filter changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset when query changes
	useEffect(() => {
		setActiveIndex(0);
	}, [query]);

	// Scroll active item into view
	useEffect(() => {
		const el = listRef.current?.children[activeIndex] as
			| HTMLElement
			| undefined;
		el?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	const openPalette = useCallback(() => {
		setOpen(true);
		setQuery("");
		setActiveIndex(0);
	}, []);

	const closePalette = useCallback(() => {
		setOpen(false);
		setQuery("");
	}, []);

	const go = useCallback(
		(href: string) => {
			closePalette();
			navigate({ to: href });
		},
		[closePalette, navigate],
	);

	// Global keyboard listener
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				if (open) {
					closePalette();
				} else {
					openPalette();
				}
			}
			if (e.key === "Escape" && open) {
				closePalette();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, openPalette, closePalette]);

	// Focus trap inside palette
	useEffect(() => {
		if (open) {
			// Small delay to allow the DOM to render
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [open]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
			{/* Backdrop */}
			<button
				type="button"
				aria-label="Close command palette"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={closePalette}
			/>
			{/* Panel */}
			<div
				role="dialog"
				aria-label="Command palette"
				className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl"
			>
				<div className="flex items-center gap-3 border-b border-border px-4">
					<span className="text-muted-foreground">⌘K</span>
					<input
						ref={inputRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search pages…"
						aria-label="Search pages"
						className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						onKeyDown={(e) => {
							if (e.key === "ArrowDown") {
								e.preventDefault();
								setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1));
							} else if (e.key === "ArrowUp") {
								e.preventDefault();
								setActiveIndex((i) =>
									i <= 0 ? Math.max(filtered.length - 1, 0) : i - 1,
								);
							} else if (e.key === "Enter" && filtered[activeIndex]) {
								go(filtered[activeIndex].href);
							}
						}}
					/>
				</div>
				<div ref={listRef} className="max-h-72 overflow-y-auto p-1.5">
					{filtered.length === 0 ? (
						<p className="px-4 py-6 text-center text-sm text-muted-foreground">
							No results found.
						</p>
					) : (
						filtered.map((item, i) => {
							const Icon = item.icon;
							const active = matchRoute({ to: item.href });
							return (
								<button
									key={item.href}
									type="button"
									onClick={() => go(item.href)}
									onMouseEnter={() => setActiveIndex(i)}
									className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
										i === activeIndex
											? "bg-accent text-accent-foreground"
											: "text-foreground hover:bg-muted"
									} ${active ? "font-medium" : ""}`}
								>
									<Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
									{item.label}
									{active ? (
										<span className="ml-auto text-[10px] text-muted-foreground">
											current
										</span>
									) : null}
								</button>
							);
						})
					)}
				</div>
				<div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
					↑↓ navigate · ↵ select · esc close
				</div>
			</div>
		</div>
	);
}
