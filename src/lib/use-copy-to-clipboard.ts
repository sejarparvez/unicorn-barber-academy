// src/lib/use-copy-to-clipboard.ts
// Shared clipboard helper with a self-resetting "copied" flag. Previously
// duplicated in contact-page CopyRow and dashboard certificates.
import { useCallback, useEffect, useState } from "react";

export function useCopyToClipboard(resetAfterMs = 2000): {
	copied: boolean;
	copy: (text: string) => Promise<boolean>;
} {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), resetAfterMs);
		return () => clearTimeout(timer);
	}, [copied, resetAfterMs]);

	const copy = useCallback(async (text: string): Promise<boolean> => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			return true;
		} catch {
			return false;
		}
	}, []);

	return { copied, copy };
}
