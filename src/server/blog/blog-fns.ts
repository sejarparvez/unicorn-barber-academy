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
import { renderMarkdown } from "@/lib/markdown";
import { parseRole } from "@/lib/roles";
import {
	getAdjacentPosts,
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
	recordPostView,
} from "@/server/blog/blog-db";
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
	.validator(
		(input?: {
			status?: BlogStatus;
			search?: string;
			category?: number;
			page?: number;
			sortByViews?: boolean;
		}) => input,
	)
	.handler(async ({ data }): Promise<Paginated<BlogPostSummary>> => {
		await requireAdminSession();
		return runSafe(() =>
			listAllPosts({
				status: parseBlogStatus(data?.status),
				search: clampSearchTerm(data?.search),
				categoryId: data?.category,
				page: clampPage(data?.page),
				perPage: 20,
				sortByViews: data?.sortByViews === true,
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
				// 220 = widest slug column (blog_slug_redirect.old_slug).
				const slug = clampSearchTerm(data.slug, 220);
				const published = await getPublishedBySlug(slug);
				if (published)
					return { kind: "post", post: published, isPreview: false };

				const existingPost = await getAnyBySlug(slug);
				if (existingPost && existingPost.status === "draft") {
					const session = await getSession();
					if (session?.user.role === "admin") {
						return { kind: "post", post: existingPost, isPreview: true };
					}
				}

				// Renamed? 301 to wherever the post lives now.
				const toSlug = await getSlugRedirectTarget(slug);
				if (toSlug) return { kind: "redirect", toSlug };

				return { kind: "missing" };
			}),
	);

/**
 * Public post fetch that ALSO renders markdown to sanitized HTML on the
 * server. Kept separate from getPostForPublicFn because the sanitizing
 * renderer (lib/markdown) is Node-only and must never be imported by a
 * client-bundled route file.
 */
export type PublicPostHtml =
	| {
			kind: "post";
			post: Omit<BlogPostFull, "contentMd"> & {
				html: string;
				toc: TocEntry[];
			};
			isPreview: boolean;
			relatedPosts: BlogPostSummary[];
			adjacent: {
				prev: BlogPostSummary | null;
				next: BlogPostSummary | null;
			};
	  }
	| { kind: "redirect"; toSlug: string }
	| { kind: "missing" };

/** Table-of-contents entry extracted from a rendered H2. */
export type TocEntry = { id: string; text: string };

/** Pull H2 anchors (added by the markdown pipeline) for the article TOC.
    Runs on our own sanitized HTML — ids are slugified, inner tags stripped. */
export function extractToc(html: string): TocEntry[] {
	const entries: TocEntry[] = [];
	for (const match of html.matchAll(/<h2\s+id="([^"]+)">([\s\S]*?)<\/h2>/g)) {
		const text = (match[2] ?? "")
			.replace(/<[^>]+>/g, "")
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.trim();
		if (match[1] && text) entries.push({ id: match[1], text });
	}
	return entries;
}

export const getPostForPublicHtmlFn = createServerFn({ method: "GET" })
	.validator((input: { slug: string }) => input)
	.handler(
		async ({ data }): Promise<PublicPostHtml> =>
			runSafe(async () => {
				const result = await getPostForPublicFn({
					data: { slug: data.slug },
				});

				if (result.kind !== "post") return result;

				// Count the view for published reads only: previews are excluded,
				// and so are signed-in admins (their own QA browsing shouldn't
				// inflate numbers). Fire-and-forget — never blocks the render.
				if (!result.isPreview) {
					void getSession().then((session) => {
						if (parseRole(session?.user.role) !== "admin") {
							recordPostView(result.post.id);
						}
					});
				}

				const relatedPosts = await getRelatedPostsFn({
					data: {
						postId: result.post.id,
						categoryId: result.post.category?.id ?? null,
						tags: result.post.tags,
					},
				});

				const { contentMd, ...post } = result.post;
				const html = renderMarkdown(contentMd);
				return {
					kind: "post",
					post: { ...post, html, toc: extractToc(html) },
					isPreview: result.isPreview,
					relatedPosts,
					adjacent: result.isPreview
						? { prev: null, next: null }
						: await getAdjacentPosts(result.post.id),
				};
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
