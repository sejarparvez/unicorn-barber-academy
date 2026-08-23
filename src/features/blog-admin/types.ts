// src/features/blog-admin/types.ts
// Shared editor form state for the blog post editor (new + edit pages).
import type { BlogStatus } from "@/lib/blog";

function uid(): string {
	return (
		globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
	);
}

export type PostFormState = {
	title: string;
	slug: string;
	slugTouched: boolean;
	excerpt: string;
	contentMd: string;
	coverImageUrl: string;
	coverImageAlt: string;
	metaTitle: string;
	metaDescription: string;
	focusKeyword: string;
	seoKeywords: string[];
	canonicalUrl: string;
	ogImageUrl: string;
	noindex: boolean;
	/** Editor rows carry stable ids so React state survives deletions. */
	keyTakeaways: Array<{ id: string; text: string }>;
	faq: Array<{ id: string; q: string; a: string }>;
	relatedProgramSlugs: string[];
	tags: string[];
	status: BlogStatus;
	categoryId: number | null;
};

/** DB shape → editor rows with stable keys. */
export function formRowsFromPost(post?: {
	keyTakeaways: string[];
	faq: { q: string; a: string }[];
}): Pick<PostFormState, "keyTakeaways" | "faq"> {
	return {
		keyTakeaways: (post?.keyTakeaways ?? []).map((text) => ({
			id: uid(),
			text,
		})),
		faq: (post?.faq ?? []).map((item) => ({ id: uid(), ...item })),
	};
}
