// src/service/blog.ts
// TanStack Query hooks for the blog admin surfaces. Same contract as
// service/enrollment.ts — reads wrap server functions, mutations invalidate
// precisely (post detail + affected lists).
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	bulkDeletePosts,
	bulkSetPostStatus,
	createCategory,
	createPost,
	deleteCategory,
	deletePost,
	type PostPayloadClient,
	renameCategory,
	setPostStatus,
	updatePost,
} from "@/lib/api/blog-admin";
import type { BlogCategory, BlogPostSummary, BlogStatus } from "@/lib/blog";
import { queryKeys } from "./query-keys";

/* -------------------------------- reads --------------------------------- */

type ListPage = {
	items: BlogPostSummary[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
};

export function useAdminPosts(
	filters: {
		status?: BlogStatus;
		search?: string;
		category?: number;
		page?: number;
	},
	options?: { initialData?: ListPage },
) {
	return useQuery({
		queryKey: queryKeys.adminPosts(filters),
		queryFn: async (): Promise<ListPage> => {
			const { listAdminPostsFn } = await import("@/server/blog-fns");
			return listAdminPostsFn({
				data: {
					status: filters.status,
					search: filters.search,
					category: filters.category,
					page: filters.page ?? 1,
				},
			});
		},
		initialData: options?.initialData,
		staleTime: 30_000,
		placeholderData: keepPreviousData,
	});
}

export function useBlogCategories(options?: { initialData?: BlogCategory[] }) {
	return useQuery({
		queryKey: queryKeys.blogCategories(),
		queryFn: async (): Promise<BlogCategory[]> => {
			const { listCategoriesFn } = await import("@/server/blog-fns");
			return listCategoriesFn();
		},
		initialData: options?.initialData,
		staleTime: 60_000,
	});
}

/* ------------------------------ mutations ------------------------------- */

function useInvalidateBlog() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: queryKeys.adminPosts() });
		void queryClient.invalidateQueries({
			queryKey: queryKeys.blogCategories(),
		});
	};
}

export function useSavePost(id?: number) {
	const invalidate = useInvalidateBlog();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: PostPayloadClient) => {
			if (id) return updatePost(id, payload);
			return createPost(payload);
		},
		onSuccess: (saved) => {
			invalidate();
			void queryClient.invalidateQueries({
				queryKey: queryKeys.adminPost(saved.id),
			});
		},
	});
}

export function useDeletePost() {
	const invalidate = useInvalidateBlog();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => deletePost(id),
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.adminPosts() });
			const previous = queryClient.getQueriesData({
				queryKey: queryKeys.adminPosts(),
			});
			queryClient.setQueriesData(
				{ queryKey: queryKeys.adminPosts() },
				(old: ListPage | undefined) => {
					if (!old) return old;
					return {
						...old,
						items: old.items.filter((item) => item.id !== id),
						total: old.total - 1,
					};
				},
			);
			return { previous };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				for (const [key, data] of context.previous) {
					queryClient.setQueryData(key, data);
				}
			}
		},
		onSettled: () => invalidate(),
	});
}

export function useSetPostStatus() {
	const invalidate = useInvalidateBlog();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			id: number;
			action: "publish" | "unpublish" | "archive";
		}) => setPostStatus(input.id, input.action),
		onMutate: async (input) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.adminPosts() });
			const previous = queryClient.getQueriesData({
				queryKey: queryKeys.adminPosts(),
			});
			const statusMap: Record<string, BlogStatus> = {
				publish: "published",
				unpublish: "draft",
				archive: "archived",
			};
			const newStatus = statusMap[input.action];
			queryClient.setQueriesData(
				{ queryKey: queryKeys.adminPosts() },
				(old: ListPage | undefined) => {
					if (!old) return old;
					return {
						...old,
						items: old.items.map((item) =>
							item.id === input.id ? { ...item, status: newStatus } : item,
						),
					};
				},
			);
			return { previous };
		},
		onError: (_err, _input, context) => {
			if (context?.previous) {
				for (const [key, data] of context.previous) {
					queryClient.setQueryData(key, data);
				}
			}
		},
		onSettled: () => invalidate(),
	});
}

export function useCreateCategory() {
	const invalidate = useInvalidateBlog();
	return useMutation({
		mutationFn: async (name: string) => createCategory(name),
		onSuccess: () => invalidate(),
	});
}

export function useRenameCategory() {
	const invalidate = useInvalidateBlog();
	return useMutation({
		mutationFn: async (input: { id: number; name: string }) =>
			renameCategory(input.id, input.name),
		onSuccess: () => invalidate(),
	});
}

export function useDeleteCategory() {
	const invalidate = useInvalidateBlog();
	return useMutation({
		mutationFn: async (id: number) => deleteCategory(id),
		onSuccess: () => invalidate(),
	});
}

export function useBulkSetPostStatus() {
	const invalidate = useInvalidateBlog();
	return useMutation({
		mutationFn: async (input: {
			ids: number[];
			status: "draft" | "published" | "archived";
		}) => bulkSetPostStatus(input.ids, input.status),
		onSuccess: () => invalidate(),
	});
}

export function useBulkDeletePosts() {
	const invalidate = useInvalidateBlog();
	return useMutation({
		mutationFn: async (ids: number[]) => bulkDeletePosts(ids),
		onSuccess: () => invalidate(),
	});
}
