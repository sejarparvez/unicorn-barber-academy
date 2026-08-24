// src/server/blog-fns.ts
// Server-function wrappers around blog-db for TanStack Router loaders.
// Route files import these instead of touching the DB layer directly, so
// client-side navigations re-run the query on the server (loaders that
// import server-only modules must be createServerFn).
//
// Every handler is a public RPC endpoint: admin fns guard the session
// in-handler (requireAdminSession), untrusted params are clamped, and all
// DB work runs through runSafe so driver errors never reach the client.
import { createServerFn } from "@tanstack/react-start";
import type {
	BlogCategory,
	BlogPostFull,
	BlogPostSummary,
	BlogStatus,
	Paginated,
} from "@/lib/blog";
import { parseBlogStatus } from "@/lib/blog";
import {
	getAnyBySlug,
	getCategoryBySlug,
	getPostById,
	getPublishedBySlug,
	getSlugRedirectTarget,
	listAllPosts,
	listCategories,
	listPublishedByCategory,
	listPublishedPosts,
	listRelatedPosts,
} from "@/server/blog-db";
import {
	clampId,
	clampPage,
	clampSearchTerm,
	runSafe,
} from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";
import { getSession } from "@/server/session";

export const listPublishedPostsFn = createServerFn({ method: "GET" })
	.validator((input?: { page?: number }) => input)
	.handler(
		async ({ data }): Promise<Paginated<BlogPostSummary>> =>
			runSafe(() => listPublishedPosts({ page: clampPage(data?.page) })),
	);

export const listAdminPostsFn = createServerFn({ method: "GET" })
	.validator((input?: { status?: BlogStatus; page?: number }) => input)
	.handler(async ({ data }): Promise<Paginated<BlogPostSummary>> => {
		await requireAdminSession();
		return runSafe(() =>
			listAllPosts({
				status: parseBlogStatus(data?.status),
				page: clampPage(data?.page),
				perPage: 20,
			}),
		);
	});

export const getAdminPostFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }): Promise<BlogPostFull | null> => {
		await requireAdminSession();
		return runSafe(() => getPostById(clampId(data.id)));
	});

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
	.handler(
		async ({ data }): Promise<PublicPostResult> =>
			runSafe(async () => {
				const slug = clampSearchTerm(data.slug, 200);
				const published = await getPublishedBySlug(slug);
				if (published)
					return { kind: "post", post: published, isPreview: false };

				const any = await getAnyBySlug(slug);
				if (any && any.status === "draft") {
					const session = await getSession();
					if (session?.user.role === "admin") {
						return { kind: "post", post: any, isPreview: true };
					}
				}

				// Renamed? 301 to wherever the post lives now.
				const toSlug = await getSlugRedirectTarget(slug);
				if (toSlug) return { kind: "redirect", toSlug };

				return { kind: "missing" };
			}),
	);

/** Post-to-post internal linking for the detail page. */
export const getRelatedPostsFn = createServerFn({ method: "GET" })
	.validator(
		(input: { postId: number; categoryId: number | null; tags: string[] }) =>
			input,
	)
	.handler(
		async ({ data }): Promise<BlogPostSummary[]> =>
			runSafe(() => {
				const tags = Array.isArray(data.tags)
					? data.tags
							.filter((t): t is string => typeof t === "string")
							.map((t) => t.slice(0, 40))
							.slice(0, 8)
					: [];
				return listRelatedPosts({
					postId: clampId(data.postId),
					categoryId:
						data.categoryId === null ? null : clampId(data.categoryId),
					tags,
					limit: 3,
				});
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
		} | null> =>
			runSafe(async () => {
				const category = await getCategoryBySlug(
					clampSearchTerm(data.slug, 200),
				);
				if (!category) return null;
				const posts = await listPublishedByCategory({
					categoryId: category.id,
					page: clampPage(data.page),
				});
				return { category, posts };
			}),
	);

export const listCategoriesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<BlogCategory[]> => runSafe(() => listCategories()),
);
