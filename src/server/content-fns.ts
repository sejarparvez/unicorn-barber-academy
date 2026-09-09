// src/server/content-fns.ts
// Public reads (no guard) + admin-only mutations for content collections.
import { createServerFn } from "@tanstack/react-start";
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
import { parseGalleryCategory } from "@/lib/content";
import { logAdminAction } from "@/server/audit-log";
import {
	createFaq,
	createGalleryItem,
	createInstructor,
	createTestimonial,
	deleteFaq,
	deleteGalleryItem,
	deleteInstructor,
	deleteTestimonial,
	listFaqsAdmin,
	listFaqsPublic,
	listFeaturedGallery,
	listGalleryAdmin,
	listGalleryPublic,
	listInstructorsAdmin,
	listInstructorsPublic,
	listTestimonialsAdmin,
	listTestimonialsPublic,
	updateFaq,
	updateGalleryItem,
	updateInstructor,
	updateTestimonial,
} from "@/server/content-db";
import {
	parseFaqPayload,
	parseGalleryPayload,
	parseInstructorPayload,
	parseTestimonialPayload,
} from "@/server/content-validate";
import { clampId, runSafe } from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";

/* --------------------------------- public -------------------------------- */

export const listInstructorsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<InstructorView[]> => runSafe(() => listInstructorsPublic()),
);

export const listGalleryFn = createServerFn({ method: "GET" })
	.validator((input?: { category?: string }) => input)
	.handler(
		async ({ data }): Promise<GalleryView[]> =>
			runSafe(() => listGalleryPublic(parseGalleryCategory(data?.category))),
	);

export const listTestimonialsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<TestimonialView[]> =>
		runSafe(() => listTestimonialsPublic()),
);

export const listFaqsFn = createServerFn({ method: "GET" })
	.validator((input: { placement: string }) => input)
	.handler(async ({ data }): Promise<FaqView[]> => {
		const placement = data.placement === "contact" ? "contact" : "home";
		return runSafe(() => listFaqsPublic(placement));
	});

export const listFeaturedGalleryFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<GalleryView[]> => runSafe(() => listFeaturedGallery(6)),
);

/* --------------------------------- admin --------------------------------- */

const MUTATION_MESSAGES = {
	"not-found": "Not found",
	"slug-taken": "Slug already taken",
	"member-taken": "Member number already taken",
} as const;

function mutationError(reason: keyof typeof MUTATION_MESSAGES): Error {
	return new Error(MUTATION_MESSAGES[reason]);
}

export const listInstructorsAdminFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<InstructorAdmin[]> => {
		await requireAdminSession();
		return runSafe(() => listInstructorsAdmin());
	},
);

export const createInstructorFn = createServerFn({ method: "POST" })
	.validator((input: Record<string, unknown>) => input)
	.handler(async ({ data }): Promise<{ id: number }> => {
		const session = await requireAdminSession();
		const parsed = parseInstructorPayload(data);
		if (!parsed.ok) throw new Error(parsed.message);
		const result = await runSafe(() => createInstructor(parsed.value));
		if (!result.ok) throw mutationError(result.reason);
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "instructor.create",
			targetType: "instructor",
			targetId: result.id ?? 0,
			summary: `Added instructor ${parsed.value.name}`,
			metadata: { slug: parsed.value.slug },
		});
		return { id: result.id ?? 0 };
	});

export const updateInstructorFn = createServerFn({ method: "POST" })
	.validator((input: { id: number; patch: Record<string, unknown> }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const b = data.patch;
		const clean: Record<string, unknown> = {};
		if (b.slug !== undefined) {
			const slug = String(b.slug)
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
			if (!slug) throw new Error("Invalid slug");
			clean.slug = slug;
		}
		for (const key of ["name", "title", "memberNo"] as const) {
			if (b[key] !== undefined) {
				const v = String(b[key]).trim().slice(0, 200);
				if (!v) throw new Error(`${key} cannot be empty`);
				clean[key] = v;
			}
		}
		if (b.track !== undefined) {
			if (b.track !== "barbering" && b.track !== "beauty") {
				throw new Error("Invalid track");
			}
			clean.track = b.track;
		}
		if (b.years !== undefined) {
			const years = Number.parseInt(String(b.years), 10);
			if (!Number.isInteger(years) || years < 0 || years > 80) {
				throw new Error("Invalid years");
			}
			clean.years = years;
		}
		if (b.bio !== undefined) clean.bio = String(b.bio).slice(0, 2000);
		if (b.specialties !== undefined) {
			clean.specialties = Array.isArray(b.specialties)
				? [
						...new Set(
							b.specialties
								.filter((s): s is string => typeof s === "string")
								.map((s) => s.trim().slice(0, 60))
								.filter(Boolean),
						),
					].slice(0, 8)
				: [];
		}
		if (b.imageUrl !== undefined) {
			const url = String(b.imageUrl).trim() || null;
			if (url && !/^https:\/\//.test(url))
				throw new Error("Image must be an https URL");
			clean.imageUrl = url;
		}
		if (b.imageAlt !== undefined)
			clean.imageAlt = String(b.imageAlt).slice(0, 300) || null;
		if (b.instagram !== undefined) {
			const url = String(b.instagram).trim() || null;
			if (url && !/^https:\/\//.test(url))
				throw new Error("Instagram must be an https URL");
			clean.instagram = url;
		}
		if (b.programSlug !== undefined)
			clean.programSlug = String(b.programSlug).trim() || null;
		if (b.lead !== undefined) clean.lead = b.lead === true;
		if (b.quote !== undefined)
			clean.quote = String(b.quote).slice(0, 500) || null;
		if (b.sortOrder !== undefined)
			clean.sortOrder = Number.parseInt(String(b.sortOrder), 10) || 0;
		if (b.isPublished !== undefined) clean.isPublished = b.isPublished === true;
		if (Object.keys(clean).length === 0) return { ok: true };
		const result = await runSafe(() =>
			updateInstructor(id, clean as Parameters<typeof updateInstructor>[1]),
		);
		if (!result.ok) throw mutationError(result.reason);
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "instructor.update",
			targetType: "instructor",
			targetId: id,
			summary: `Updated instructor #${id}: ${Object.keys(clean).join(", ")}`,
			metadata: { fields: Object.keys(clean) },
		});
		return { ok: true };
	});

export const deleteInstructorFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const deleted = await runSafe(() => deleteInstructor(id));
		if (!deleted) throw new Error("Not found");
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "instructor.delete",
			targetType: "instructor",
			targetId: id,
			summary: `Deleted instructor #${id}`,
			metadata: {},
		});
		return { ok: true };
	});

export const listGalleryAdminFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<GalleryAdmin[]> => {
		await requireAdminSession();
		return runSafe(() => listGalleryAdmin());
	},
);

export const createGalleryItemFn = createServerFn({ method: "POST" })
	.validator((input: Record<string, unknown>) => input)
	.handler(async ({ data }): Promise<{ id: number }> => {
		const session = await requireAdminSession();
		const parsed = parseGalleryPayload(data);
		if (!parsed.ok) throw new Error(parsed.message);
		const result = await runSafe(() => createGalleryItem(parsed.value));
		if (!result.ok) throw mutationError(result.reason);
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "gallery.create",
			targetType: "gallery_item",
			targetId: result.id ?? 0,
			summary: `Added gallery photo (${parsed.value.category})`,
			metadata: { category: parsed.value.category },
		});
		return { id: result.id ?? 0 };
	});

export const updateGalleryItemFn = createServerFn({ method: "POST" })
	.validator((input: { id: number; patch: Record<string, unknown> }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const b = data.patch;
		const clean: Record<string, unknown> = {};
		if (b.category !== undefined) {
			const category = parseGalleryCategory(b.category);
			if (!category) throw new Error("Invalid category");
			clean.category = category;
		}
		if (b.imageUrl !== undefined) {
			const url = String(b.imageUrl).trim() || null;
			if (url && !/^https:\/\//.test(url))
				throw new Error("Image must be an https URL");
			clean.imageUrl = url;
		}
		if (b.imageAlt !== undefined) {
			const alt = String(b.imageAlt).trim().slice(0, 300);
			if (!alt) throw new Error("Alt text is required");
			clean.imageAlt = alt;
		}
		if (b.caption !== undefined)
			clean.caption = String(b.caption).slice(0, 300) || null;
		if (b.sortOrder !== undefined)
			clean.sortOrder = Number.parseInt(String(b.sortOrder), 10) || 0;
		if (b.isPublished !== undefined) clean.isPublished = b.isPublished === true;
		if (b.isFeatured !== undefined) clean.isFeatured = b.isFeatured === true;
		if (Object.keys(clean).length === 0) return { ok: true };
		const result = await runSafe(() =>
			updateGalleryItem(id, clean as Parameters<typeof updateGalleryItem>[1]),
		);
		if (!result.ok) throw mutationError(result.reason);
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "gallery.update",
			targetType: "gallery_item",
			targetId: id,
			summary: `Updated gallery photo #${id}: ${Object.keys(clean).join(", ")}`,
			metadata: { fields: Object.keys(clean) },
		});
		return { ok: true };
	});

export const deleteGalleryItemFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const deleted = await runSafe(() => deleteGalleryItem(id));
		if (!deleted) throw new Error("Not found");
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "gallery.delete",
			targetType: "gallery_item",
			targetId: id,
			summary: `Deleted gallery photo #${id}`,
			metadata: {},
		});
		return { ok: true };
	});

export const listTestimonialsAdminFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<TestimonialAdmin[]> => {
	await requireAdminSession();
	return runSafe(() => listTestimonialsAdmin());
});

export const listFaqsAdminFn = createServerFn({ method: "GET" })
	.validator((input?: { placement?: string }) => input)
	.handler(async ({ data }): Promise<FaqAdmin[]> => {
		await requireAdminSession();
		const placement =
			data?.placement === "home" || data?.placement === "contact"
				? data.placement
				: undefined;
		return runSafe(() => listFaqsAdmin(placement));
	});

export const createFaqFn = createServerFn({ method: "POST" })
	.validator((input: Record<string, unknown>) => input)
	.handler(async ({ data }): Promise<{ id: number }> => {
		await requireAdminSession();
		const parsed = parseFaqPayload(data);
		if (!parsed.ok) throw new Error(parsed.message);
		const result = await runSafe(() => createFaq(parsed.value));
		if (!result.ok) throw mutationError(result.reason);
		return { id: result.id ?? 0 };
	});

export const updateFaqFn = createServerFn({ method: "POST" })
	.validator((input: { id: number; patch: Record<string, unknown> }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const b = data.patch;
		const clean: Record<string, unknown> = {};
		if (b.placement !== undefined) {
			if (b.placement !== "home" && b.placement !== "contact") {
				throw new Error("Invalid placement");
			}
			clean.placement = b.placement;
		}
		if (b.question !== undefined) {
			const v = String(b.question).trim().slice(0, 300);
			if (!v) throw new Error("Question cannot be empty");
			clean.question = v;
		}
		if (b.answer !== undefined) {
			const v = String(b.answer).trim().slice(0, 2000);
			if (!v) throw new Error("Answer cannot be empty");
			clean.answer = v;
		}
		if (b.sortOrder !== undefined) {
			clean.sortOrder = Number.parseInt(String(b.sortOrder), 10) || 0;
		}
		if (b.isPublished !== undefined) clean.isPublished = b.isPublished === true;
		if (Object.keys(clean).length === 0) return { ok: true };
		const result = await runSafe(() =>
			updateFaq(id, clean as Parameters<typeof updateFaq>[1]),
		);
		if (!result.ok) throw mutationError(result.reason);
		return { ok: true };
	});

export const deleteFaqFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const deleted = await runSafe(() => deleteFaq(id));
		if (!deleted) throw new Error("Not found");
		return { ok: true };
	});

export const createTestimonialFn = createServerFn({ method: "POST" })
	.validator((input: Record<string, unknown>) => input)
	.handler(async ({ data }): Promise<{ id: number }> => {
		const session = await requireAdminSession();
		const parsed = parseTestimonialPayload(data);
		if (!parsed.ok) throw new Error(parsed.message);
		const result = await runSafe(() => createTestimonial(parsed.value));
		if (!result.ok) throw mutationError(result.reason);
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "testimonial.create",
			targetType: "testimonial",
			targetId: result.id ?? 0,
			summary: `Added testimonial from ${parsed.value.name}`,
			metadata: {},
		});
		return { id: result.id ?? 0 };
	});

export const updateTestimonialFn = createServerFn({ method: "POST" })
	.validator((input: { id: number; patch: Record<string, unknown> }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const b = data.patch as Record<string, unknown>;
		const clean: Record<string, unknown> = {};
		for (const key of [
			"quote",
			"name",
			"programSlug",
			"programName",
			"cohort",
			"imageUrl",
			"imageAlt",
			"rating",
			"sortOrder",
			"isPublished",
		]) {
			if (b[key] !== undefined) clean[key] = b[key];
		}
		if (Object.keys(clean).length === 0) return { ok: true };
		if (clean.quote !== undefined && String(clean.quote).trim().length === 0) {
			throw new Error("Quote cannot be empty");
		}
		if (clean.name !== undefined && String(clean.name).trim().length === 0) {
			throw new Error("Name cannot be empty");
		}
		const result = await runSafe(() =>
			updateTestimonial(id, clean as Parameters<typeof updateTestimonial>[1]),
		);
		if (!result.ok) throw mutationError(result.reason);
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "testimonial.update",
			targetType: "testimonial",
			targetId: id,
			summary: `Updated testimonial #${id}: ${Object.keys(clean).join(", ")}`,
			metadata: { fields: Object.keys(clean) },
		});
		return { ok: true };
	});

export const deleteTestimonialFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const deleted = await runSafe(() => deleteTestimonial(id));
		if (!deleted) throw new Error("Not found");
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "testimonial.delete",
			targetType: "testimonial",
			targetId: id,
			summary: `Deleted testimonial #${id}`,
			metadata: {},
		});
		return { ok: true };
	});
