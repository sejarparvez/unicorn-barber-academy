// src/server/blog-fns.ts
// Server-function wrappers around blog-db for TanStack Router loaders.
// Route files import these instead of touching the DB layer directly, so
// client-side navigations re-run the query on the server (loaders that
// import server-only modules must be createServerFn).
import { createServerFn } from "@tanstack/react-start";
import type {
	BlogCategory,
	BlogPostFull,
	BlogPostSummary,
	BlogStatus,
	Paginated,
} from "@/lib/blog";
import {
	getAnyBySlug,
	getCategoryBySlug,
	getPostById,
	getPublishedBySlug,
	listAllPosts,
	listCategories,
	listPublishedByCategory,
	listPublishedPosts,
	listRelatedPosts,
} from "@/server/blog-db";
import { getSession } from "@/server/session";

export const listPublishedPostsFn = createServerFn({ method: "GET" })
	.validator((input?: { page?: number }) => input)
	.handler(
		async ({ data }): Promise<Paginated<BlogPostSummary>> =>
			listPublishedPosts({ page: data?.page }),
	);

export const listAdminPostsFn = createServerFn({ method: "GET" })
	.validator((input?: { status?: BlogStatus; page?: number }) => input)
	.handler(
		async ({ data }): Promise<Paginated<BlogPostSummary>> =>
			listAllPosts({
				status: data?.status,
				page: data?.page ?? 1,
				perPage: 20,
			}),
	);

export const getAdminPostFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(
		async ({ data }): Promise<BlogPostFull | null> => getPostById(data.id),
	);

/**
 * Public post fetch with admin preview AND slug-rename redirects:
 *   * published posts render for everyone;
 *   * drafts render only for an admin session (page then ships noindex);
 *   * archived/unknown slugs fall back to the redirect table so renamed
 *     URLs keep resolving with a 301 instead of hard-404ing.
 */
export type PublicPostResult =
	| { kind: "post"; post: BlogPostFull; isPreview: boolean }
	| { kind: "redirect"; toSlug: string }
	| { kind: "missing" };

export const getPostForPublicFn = createServerFn({ method: "GET" })
	.validator((input: { slug: string }) => input)
	.handler(async ({ data }): Promise<PublicPostResult> => {
		const published = await getPublishedBySlug(data.slug);
		if (published) return { kind: "post", post: published, isPreview: false };

		const any = await getAnyBySlug(data.slug);
		if (any && any.status === "draft") {
			const session = await getSession();
			if (session?.user.role === "admin") {
				return { kind: "post", post: any, isPreview: true };
			}
		}

		// Renamed? 301 to wherever the post lives now.
		const { getSlugRedirectTarget } = await import("./blog-db");
		const toSlug = await getSlugRedirectTarget(data.slug);
		if (toSlug) return { kind: "redirect", toSlug };

		return { kind: "missing" };
	});

/** Post-to-post internal linking for the detail page. */
export const getRelatedPostsFn = createServerFn({ method: "GET" })
	.validator(
		(input: { postId: number; categoryId: number | null; tags: string[] }) =>
			input,
	)
	.handler(
		async ({ data }): Promise<BlogPostSummary[]> =>
			listRelatedPosts({
				postId: data.postId,
				categoryId: data.categoryId,
				tags: data.tags,
				limit: 3,
			}),
	);

/** Category archive header + paginated posts, or null when slug unknown. */
export const getCategoryArchiveFn = createServerFn({ method: "GET" })
	.validator((input: { slug: string; page?: number }) => input)
	.handler(
		async ({
			data,
		}): Promise<{
			category: BlogCategory;
			posts: Paginated<BlogPostSummary>;
		} | null> => {
			const category = await getCategoryBySlug(data.slug);
			if (!category) return null;
			const posts = await listPublishedByCategory({
				categoryId: category.id,
				page: data.page,
			});
			return { category, posts };
		},
	);

export const listCategoriesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<BlogCategory[]> => listCategories(),
);
