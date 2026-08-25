import { describe, expect, test } from "bun:test";
import { ALL_PROGRAMS } from "@/data/programs";
import { parseCategoryPayload, parsePostPayload } from "@/server/blog-validate";

const validPost = {
	title: "  Fade fundamentals  ",
	status: "published",
	coverImageUrl: "https://cdn.example.com/cover.jpg",
	coverImageAlt: "Student executing a skin fade",
};

describe("parsePostPayload", () => {
	test("normalizes title whitespace and derives a slug from it", () => {
		const result = parsePostPayload(validPost);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.title).toBe("Fade fundamentals");
			expect(result.value.slug).toBe("fade-fundamentals");
			expect(result.value.status).toBe("published");
		}
	});

	test("rejects missing/oversized titles", () => {
		expect(parsePostPayload({ ...validPost, title: "" }).ok).toBe(false);
		expect(parsePostPayload({ ...validPost, title: "x".repeat(201) }).ok).toBe(
			false,
		);
	});

	test("cover image requires alt text (accessibility contract)", () => {
		const result = parsePostPayload({
			...validPost,
			coverImageAlt: undefined,
		});
		expect(result.ok).toBe(false);
	});

	test("non-http(s) URLs are rejected outright", () => {
		for (const field of ["coverImageUrl", "canonicalUrl", "ogImageUrl"]) {
			const result = parsePostPayload({ ...validPost, [field]: "ftp://x" });
			expect(result.ok).toBe(false);
		}
	});

	test("javascript: URL cannot sneak into cover image", () => {
		expect(
			parsePostPayload({
				...validPost,
				coverImageUrl: "javascript:alert(1)",
			}).ok,
		).toBe(false);
	});

	test("unknown status falls back to draft instead of storing junk", () => {
		const result = parsePostPayload({
			...validPost,
			status: "super-published",
		});
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.status).toBe("draft");
	});

	test("related program slugs are filtered against the real catalog", () => {
		const realSlug = ALL_PROGRAMS[0].slug;
		const result = parsePostPayload({
			...validPost,
			relatedProgramSlugs: [realSlug, "welding", realSlug],
		});
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.relatedProgramSlugs).toEqual([realSlug]);
	});

	test("lists are deduped and capped", () => {
		const result = parsePostPayload({
			...validPost,
			tags: Array(30).fill("tag"),
			seoKeywords: ["a", "a", "b"],
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.tags.length).toBeLessThanOrEqual(12);
			expect(result.value.seoKeywords).toEqual(["a", "b"]);
		}
	});

	test("FAQ items without both q and a are dropped", () => {
		const result = parsePostPayload({
			...validPost,
			faq: [{ q: "Q1?", a: "A1" }, { q: "Only question" }, null, "junk"],
		});
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.faq).toEqual([{ q: "Q1?", a: "A1" }]);
	});

	test("oversized content is rejected before hitting the DB", () => {
		expect(
			parsePostPayload({ ...validPost, contentMd: "x".repeat(400_001) }).ok,
		).toBe(false);
	});

	test("garbage category ids are rejected", () => {
		expect(parsePostPayload({ ...validPost, categoryId: "abc" }).ok).toBe(
			false,
		);
		expect(parsePostPayload({ ...validPost, categoryId: -2 }).ok).toBe(false);
	});

	test("noindex only activates on explicit true", () => {
		const result = parsePostPayload({ ...validPost });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.noindex).toBe(false);
	});
});

describe("parseCategoryPayload", () => {
	test("accepts a name and derives the slug", () => {
		const result = parseCategoryPayload({ name: "Career Advice" });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.slug).toBe("career-advice");
	});

	test("rejects empty or oversized names", () => {
		expect(parseCategoryPayload({ name: "" }).ok).toBe(false);
		expect(parseCategoryPayload({ name: "x".repeat(81) }).ok).toBe(false);
	});

	test("rejects non-object bodies", () => {
		expect(parseCategoryPayload(null).ok).toBe(false);
	});
});
