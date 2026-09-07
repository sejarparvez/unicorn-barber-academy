// src/features/blog-admin/types.ts
// Shared editor form state for the blog post editor (new + edit pages).
import type { BlogPostFull, BlogStatus } from "@/lib/blog";

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

/** Full post → initial editor form state. */
export function formFromPost(post?: BlogPostFull): PostFormState {
	const rows = formRowsFromPost(post);
	return {
		title: post?.title ?? "",
		slug: post?.slug ?? "",
		slugTouched: Boolean(post),
		excerpt: post?.excerpt ?? "",
		contentMd: post?.contentMd ?? "",
		coverImageUrl: post?.coverImageUrl ?? "",
		coverImageAlt: post?.coverImageAlt ?? "",
		metaTitle: post?.metaTitle ?? "",
		metaDescription: post?.metaDescription ?? "",
		focusKeyword: post?.focusKeyword ?? "",
		seoKeywords: post?.seoKeywords ?? [],
		canonicalUrl: post?.canonicalUrl ?? "",
		ogImageUrl: post?.ogImageUrl ?? "",
		noindex: post?.noindex ?? false,
		keyTakeaways: rows.keyTakeaways,
		faq: rows.faq,
		relatedProgramSlugs: post?.relatedProgramSlugs ?? [],
		tags: post?.tags ?? [],
		status: post?.status ?? "draft",
		categoryId: post?.category?.id ?? null,
	};
}
