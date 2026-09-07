// src/features/blog-admin/use-editor-guards.ts
// Shared hooks for the blog editor: unsaved-changes guard and auto-save.
import { useBlocker } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

/**
 * Warns before SPA navigation (router blocker) and browser close/refresh
 * when the editor has unsaved changes.
 */
export function useUnsavedChangesGuard(isDirty: boolean, saving: boolean) {
	useBlocker({
		shouldBlockFn: () => {
			if (!isDirty || saving) return false;
			const leave = window.confirm(
				"You have unsaved changes. Leave without saving?",
			);
			return !leave;
		},
	});
	useEffect(() => {
		if (!isDirty) return;
		const handler = (event: BeforeUnloadEvent) => {
			event.preventDefault();
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isDirty]);
}

/**
 * Auto-saves every 30 seconds in edit mode, but only after 3 seconds of
 * user idle time (debounced via ref to avoid saving during active typing).
 * `onSave` is read from a ref so the interval never resets on re-render.
 */
export function useAutoSave(
	mode: "new" | "edit",
	isDirty: boolean,
	saving: boolean,
	onSave: (nextStatus?: undefined, isAutoSave?: boolean) => void,
) {
	const lastInputRef = useRef(Date.now());
	const onSaveRef = useRef(onSave);
	onSaveRef.current = onSave;

	useEffect(() => {
		if (mode !== "edit" || !isDirty || saving) return;
		const id = setInterval(() => {
			const idle = Date.now() - lastInputRef.current;
			if (idle >= 3_000) {
				void onSaveRef.current(undefined, true);
			}
		}, 30_000);
		return () => clearInterval(id);
	}, [mode, isDirty, saving]);

	/** Call this from the `patch` function to track idle time. */
	const markInput = () => {
		lastInputRef.current = Date.now();
	};

	return { markInput };
}
