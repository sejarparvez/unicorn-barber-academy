// src/features/admin/site-page.tsx
// Academy-global site settings: contact info, address, hours, areas served,
// and the homepage announcement banner. Saves patch only changed fields;
// derived links (tel:, WhatsApp, Maps) recompute from base values.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SETTING_KEYS, SETTING_LABELS, type SettingKey } from "@/lib/settings";
import { useSettingsBase, useUpdateSettings } from "@/service/settings";

const MULTILINE: Partial<Record<SettingKey, boolean>> = {
	hours_detail: true,
};

export function SitePage() {
	const { data: base, isPending } = useSettingsBase();
	const updateMutation = useUpdateSettings();
	const [draft, setDraft] = useState<Partial<Record<SettingKey, string>>>({});
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const value = (key: SettingKey): string => draft[key] ?? base?.[key] ?? "";
	const dirtyKeys = (Object.keys(draft) as SettingKey[]).filter(
		(key) => draft[key] !== base?.[key],
	);

	async function onSave(event: React.FormEvent) {
		event.preventDefault();
		if (dirtyKeys.length === 0 || updateMutation.isPending) return;
		setError(null);
		setNotice(null);
		const patch = Object.fromEntries(
			dirtyKeys.map((key) => [key, draft[key] ?? ""]),
		);
		try {
			await updateMutation.mutateAsync(patch);
			setDraft({});
			setNotice(
				"Site settings saved. Changes appear across the site immediately.",
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Save failed");
		}
	}

	return (
		<div className="space-y-6">
			<header>
				<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Administration
				</p>
				<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
					Site settings
				</h1>
				<p className="text-sm text-muted-foreground">
					Contact info, address, hours, and the announcement banner shown
					site-wide. Phone display text, tel:, WhatsApp, and map links are
					derived automatically.
				</p>
			</header>

			{error ? (
				<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}
			{notice ? (
				<p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
					{notice}
				</p>
			) : null}

			{isPending ? (
				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			) : (
				<form
					onSubmit={onSave}
					className="space-y-5 rounded-xl border border-border bg-card p-5"
				>
					{SETTING_KEYS.map((key) => (
						<div key={key}>
							<label htmlFor={`site-${key}`} className="text-sm font-medium">
								{SETTING_LABELS[key].label}
							</label>
							{MULTILINE[key] ? (
								<Textarea
									id={`site-${key}`}
									value={value(key)}
									onChange={(e) =>
										setDraft((d) => ({ ...d, [key]: e.target.value }))
									}
									rows={3}
									className="mt-1.5 font-mono text-sm"
								/>
							) : (
								<Input
									id={`site-${key}`}
									value={value(key)}
									onChange={(e) =>
										setDraft((d) => ({ ...d, [key]: e.target.value }))
									}
									className="mt-1.5 h-9"
									placeholder={
										key === "announcement_text"
											? "Empty hides the banner"
											: undefined
									}
								/>
							)}
							<p className="mt-1 text-xs text-muted-foreground">
								{SETTING_LABELS[key].hint}
							</p>
						</div>
					))}

					<div className="flex items-center gap-3 pt-1">
						<Button
							type="submit"
							disabled={updateMutation.isPending || dirtyKeys.length === 0}
						>
							{updateMutation.isPending
								? "Saving…"
								: dirtyKeys.length > 0
									? `Save ${dirtyKeys.length} change${dirtyKeys.length === 1 ? "" : "s"}`
									: "No changes"}
						</Button>
						{dirtyKeys.length > 0 ? (
							<Button
								type="button"
								variant="ghost"
								onClick={() => setDraft({})}
							>
								Discard
							</Button>
						) : null}
					</div>
				</form>
			)}

			<p className="text-xs text-muted-foreground">
				The canonical site URL stays in code (changing it at runtime would break
				canonicals and the sitemap). Maps links derive from the street +
				locality above.
			</p>
		</div>
	);
}
