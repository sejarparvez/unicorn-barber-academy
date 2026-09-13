// src/service/content.ts
// TanStack Query hooks for admin content collections (admin-only) plus the
// public home-page sections. The public hooks use `useSuspenseQuery` so the
// home route can render its static hero (and LCP image) immediately and let
// the DB-backed sections stream in behind Suspense boundaries instead of
// blocking the whole route loader.
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type {
	FaqAdmin,
	FaqView,
	GalleryAdmin,
	GalleryView,
	InstructorAdmin,
	InstructorView,
	TestimonialAdmin,
	TestimonialView,
} from "@/lib/content";
import {
	listFaqsAdminFn,
	listFaqsFn,
	listFeaturedGalleryFn,
	listGalleryAdminFn,
	listInstructorsAdminFn,
	listInstructorsFn,
	listTestimonialsAdminFn,
	listTestimonialsFn,
} from "@/server/content/content-fns";
import { queryKeys } from "./query-keys";

const HOME_STALE_TIME = 60_000;

export function useHomeInstructors() {
	return useSuspenseQuery({
		queryKey: queryKeys.homeInstructors(),
		queryFn: (): Promise<InstructorView[]> => listInstructorsFn(),
		staleTime: HOME_STALE_TIME,
	});
}

export function useHomeTestimonials() {
	return useSuspenseQuery({
		queryKey: queryKeys.homeTestimonials(),
		queryFn: (): Promise<TestimonialView[]> => listTestimonialsFn(),
		staleTime: HOME_STALE_TIME,
	});
}

export function useHomeFaqs() {
	return useSuspenseQuery({
		queryKey: queryKeys.homeFaqs(),
		queryFn: (): Promise<FaqView[]> =>
			listFaqsFn({ data: { placement: "home" } }),
		staleTime: HOME_STALE_TIME,
	});
}

export function useFeaturedGallery() {
	return useSuspenseQuery({
		queryKey: queryKeys.featuredGallery(),
		queryFn: (): Promise<GalleryView[]> => listFeaturedGalleryFn(),
		staleTime: HOME_STALE_TIME,
	});
}

export function useInstructorsAdmin() {
	return useQuery({
		queryKey: queryKeys.instructorsList(),
		queryFn: (): Promise<InstructorAdmin[]> => listInstructorsAdminFn(),
		staleTime: 30_000,
	});
}

export function useGalleryAdmin() {
	return useQuery({
		queryKey: queryKeys.galleryList(),
		queryFn: (): Promise<GalleryAdmin[]> => listGalleryAdminFn(),
		staleTime: 30_000,
	});
}

export function useTestimonialsAdmin() {
	return useQuery({
		queryKey: queryKeys.testimonialsList(),
		queryFn: (): Promise<TestimonialAdmin[]> => listTestimonialsAdminFn(),
		staleTime: 30_000,
	});
}

export function useFaqsAdmin(placement?: "home" | "contact") {
	return useQuery({
		queryKey: queryKeys.faqsList(placement),
		queryFn: (): Promise<FaqAdmin[]> =>
			listFaqsAdminFn({ data: placement ? { placement } : {} }),
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
				const fns = await import("@/server/content/content-fns");
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
