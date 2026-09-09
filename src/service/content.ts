// src/service/content.ts
// TanStack Query hooks for admin content collections (admin-only).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	FaqAdmin,
	GalleryAdmin,
	InstructorAdmin,
	TestimonialAdmin,
} from "@/lib/content";
import { queryKeys } from "./query-keys";

export function useInstructorsAdmin() {
	return useQuery({
		queryKey: [...queryKeys.content(), "instructors"] as const,
		queryFn: async (): Promise<InstructorAdmin[]> => {
			const { listInstructorsAdminFn } = await import("@/server/content-fns");
			return listInstructorsAdminFn();
		},
		staleTime: 30_000,
	});
}

export function useGalleryAdmin() {
	return useQuery({
		queryKey: [...queryKeys.content(), "gallery"] as const,
		queryFn: async (): Promise<GalleryAdmin[]> => {
			const { listGalleryAdminFn } = await import("@/server/content-fns");
			return listGalleryAdminFn();
		},
		staleTime: 30_000,
	});
}

export function useTestimonialsAdmin() {
	return useQuery({
		queryKey: [...queryKeys.content(), "testimonials"] as const,
		queryFn: async (): Promise<TestimonialAdmin[]> => {
			const { listTestimonialsAdminFn } = await import("@/server/content-fns");
			return listTestimonialsAdminFn();
		},
		staleTime: 30_000,
	});
}

export function useFaqsAdmin(placement?: "home" | "contact") {
	return useQuery({
		queryKey: [...queryKeys.content(), "faqs", placement ?? "all"] as const,
		queryFn: async (): Promise<FaqAdmin[]> => {
			const { listFaqsAdminFn } = await import("@/server/content-fns");
			return listFaqsAdminFn({ data: placement ? { placement } : {} });
		},
		staleTime: 30_000,
	});
}

function useInvalidateContent() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: queryKeys.content() });
	};
}

function contentMutation<TInput>(fnName: string) {
	return () => {
		const invalidate = useInvalidateContent();
		return useMutation({
			mutationFn: async (input: TInput) => {
				const fns = await import("@/server/content-fns");
				const fn = fns[fnName as keyof typeof fns] as (args: {
					data: TInput;
				}) => Promise<unknown>;
				await fn({ data: input });
			},
			onSuccess: () => invalidate(),
		});
	};
}

export const useCreateInstructor =
	contentMutation<Record<string, unknown>>("createInstructorFn");
export const useUpdateInstructor = contentMutation<{
	id: number;
	patch: Record<string, unknown>;
}>("updateInstructorFn");
export const useDeleteInstructor = contentMutation<{ id: number }>(
	"deleteInstructorFn",
);
export const useCreateGalleryItem = contentMutation<Record<string, unknown>>(
	"createGalleryItemFn",
);
export const useUpdateGalleryItem = contentMutation<{
	id: number;
	patch: Record<string, unknown>;
}>("updateGalleryItemFn");
export const useDeleteGalleryItem = contentMutation<{ id: number }>(
	"deleteGalleryItemFn",
);
export const useCreateTestimonial = contentMutation<Record<string, unknown>>(
	"createTestimonialFn",
);
export const useUpdateTestimonial = contentMutation<{
	id: number;
	patch: Record<string, unknown>;
}>("updateTestimonialFn");
export const useDeleteTestimonial = contentMutation<{ id: number }>(
	"deleteTestimonialFn",
);
export const useCreateFaq =
	contentMutation<Record<string, unknown>>("createFaqFn");
export const useUpdateFaq = contentMutation<{
	id: number;
	patch: Record<string, unknown>;
}>("updateFaqFn");
export const useDeleteFaq = contentMutation<{ id: number }>("deleteFaqFn");
