import { describe, expect, test } from "bun:test";
import {
	parseGalleryPayload,
	parseInstructorPayload,
	parseTestimonialPayload,
} from "@/server/content-validate";

describe("parseInstructorPayload", () => {
	const valid = {
		name: "Test Barber",
		title: "Instructor, Fades",
		track: "barbering",
		memberNo: "GM-99",
		years: 5,
	};

	test("accepts a clean instructor", () => {
		const result = parseInstructorPayload(valid);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.slug).toBe("test-barber");
			expect(result.value.isPublished).toBe(true);
		}
	});

	test("rejects missing name, bad track, bad years", () => {
		expect(parseInstructorPayload({ ...valid, name: "" }).ok).toBe(false);
		expect(parseInstructorPayload({ ...valid, track: "welding" }).ok).toBe(
			false,
		);
		expect(parseInstructorPayload({ ...valid, years: 99 }).ok).toBe(false);
	});

	test("rejects non-https image urls", () => {
		expect(
			parseInstructorPayload({ ...valid, imageUrl: "http://x/y.jpg" }).ok,
		).toBe(false);
	});
});

describe("parseGalleryPayload", () => {
	test("requires category + alt text", () => {
		expect(
			parseGalleryPayload({ category: "studio", imageAlt: "Studio chairs" }).ok,
		).toBe(true);
		expect(parseGalleryPayload({ category: "nope", imageAlt: "x" }).ok).toBe(
			false,
		);
		expect(parseGalleryPayload({ category: "studio", imageAlt: "" }).ok).toBe(
			false,
		);
	});
});

describe("parseTestimonialPayload", () => {
	test("requires quote + name, rating 1–5", () => {
		expect(
			parseTestimonialPayload({ quote: "Great!", name: "A", rating: 6 }).ok,
		).toBe(false);
		expect(parseTestimonialPayload({ quote: "Great!", name: "A" }).ok).toBe(
			true,
		);
		expect(parseTestimonialPayload({ quote: "", name: "A" }).ok).toBe(false);
	});
});
