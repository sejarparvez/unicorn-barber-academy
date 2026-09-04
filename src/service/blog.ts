// src/service/blog.ts
// TanStack Query hooks for the blog admin surfaces. Same contract as
// service/enrollment.ts — reads wrap server functions, mutations invalidate
// precisely (post detail + affected lists).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
	filters: { status?: BlogStatus; page?: number },
	options?: { initialData?: ListPage },
) {
	return useQuery({
		queryKey: queryKeys.adminPosts(filters),
		queryFn: async (): Promise<ListPage> => {
			const { listAdminPostsFn } = await import("@/server/blog-fns");
			return listAdminPostsFn({
				data: { status: filters.status, page: filters.page ?? 1 },
			});
		},
		initialData: options?.initialData,
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
	return useMutation({
		mutationFn: async (id: number) => deletePost(id),
		onSuccess: () => invalidate(),
	});
}

export function useSetPostStatus() {
	const invalidate = useInvalidateBlog();
	return useMutation({
		mutationFn: async (input: {
			id: number;
			action: "publish" | "unpublish" | "archive";
		}) => setPostStatus(input.id, input.action),
		onSuccess: () => invalidate(),
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
