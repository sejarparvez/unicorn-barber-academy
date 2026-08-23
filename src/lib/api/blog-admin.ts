// src/lib/api/blog-admin.ts
// Browser-side client for the /api/admin/* blog endpoints. Mirrors
// lib/api/contact.ts. Server responses are runtime-shaped by the API layer;
// types here describe the happy path.
import type { BlogCategory, BlogPostFull, BlogPostSummary } from "@/lib/blog";
import { http } from "./http";

export type PostPayloadClient = {
	slug?: string;
	title: string;
	excerpt: string | null;
	contentMd: string;
	coverImageUrl: string | null;
	coverImageAlt: string | null;
	metaTitle: string | null;
	metaDescription: string | null;
	focusKeyword: string | null;
	seoKeywords: string[];
	canonicalUrl: string | null;
	ogImageUrl: string | null;
	noindex: boolean;
	keyTakeaways: string[];
	faq: { q: string; a: string }[];
	relatedProgramSlugs: string[];
	tags: string[];
	status: "draft" | "published" | "archived";
	categoryId: number | null;
};

async function errorOf(error: unknown): Promise<string> {
	if (typeof error === "object" && error !== null) {
		const data = (error as { response?: { data?: { message?: string } } })
			.response?.data;
		if (data?.message) return data.message;
	}
	return "Something went wrong. Please try again.";
}

export async function createPost(
	payload: PostPayloadClient,
): Promise<BlogPostFull> {
	try {
		const res = await http.post<{ post: BlogPostFull }>(
			"/api/admin/blog",
			payload,
		);
		return res.data.post;
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}

export async function updatePost(
	id: number,
	payload: PostPayloadClient & { slug?: string },
): Promise<BlogPostFull> {
	try {
		const res = await http.patch<{ post: BlogPostFull }>(
			`/api/admin/blog/${id}`,
			payload,
		);
		return res.data.post;
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}

/** Status-only quick action from the list page (never touches content). */
export async function setPostStatus(
	id: number,
	action: "publish" | "unpublish" | "archive",
): Promise<void> {
	try {
		await http.patch(`/api/admin/blog/${id}`, { action });
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}

export async function deletePost(id: number): Promise<void> {
	try {
		await http.delete(`/api/admin/blog/${id}`);
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}

export async function uploadImage(file: File, name: string): Promise<string> {
	const form = new FormData();
	form.append("file", file);
	form.append("name", name);
	try {
		const res = await http.post<{ url: string }>("/api/admin/upload", form, {
			headers: { "Content-Type": undefined },
			timeout: 60_000,
		});
		return res.data.url;
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}

export async function createCategory(name: string): Promise<BlogCategory> {
	try {
		const res = await http.post<{ category: BlogCategory }>(
			"/api/admin/blog/categories",
			{ name },
		);
		return res.data.category;
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}

export async function renameCategory(id: number, name: string): Promise<void> {
	try {
		await http.patch(`/api/admin/blog/categories/${id}`, { name });
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}

export async function deleteCategory(id: number): Promise<void> {
	try {
		await http.delete(`/api/admin/blog/categories/${id}`);
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}

export function formatPostDate(iso: string | null): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export type { BlogPostSummary };
