import { describe, expect, test } from "bun:test";
import {
	BLOG_STATUS_LABELS,
	BLOG_STATUSES,
	deriveExcerpt,
	estimateReadingMinutes,
	parseBlogStatus,
	slugify,
} from "@/lib/blog";

describe("parseBlogStatus", () => {
	test("accepts every status", () => {
		for (const status of BLOG_STATUSES) {
			expect(parseBlogStatus(status)).toBe(status);
		}
	});

	test("rejects junk", () => {
		expect(parseBlogStatus("PUBLISHED")).toBeUndefined();
		expect(parseBlogStatus(undefined)).toBeUndefined();
	});
});

describe("BLOG_STATUS_LABELS", () => {
	test("covers every status", () => {
		for (const status of BLOG_STATUSES) {
			expect(BLOG_STATUS_LABELS[status].length).toBeGreaterThan(0);
		}
	});
});

describe("estimateReadingMinutes", () => {
	test("minimum of one minute", () => {
		expect(estimateReadingMinutes("short")).toBe(1);
		expect(estimateReadingMinutes("")).toBe(1);
	});

	test("200 words ≈ 1 minute, 600 ≈ 3", () => {
		const word = "word";
		expect(estimateReadingMinutes(Array(200).fill(word).join(" "))).toBe(1);
		expect(estimateReadingMinutes(Array(600).fill(word).join(" "))).toBe(3);
	});

	test("code fences are excluded from the count", () => {
		const fence = Array(400).fill("word").join(" ");
		const withCode = `${fence}\n\n\`\`\`js\n${Array(2000).fill("code").join(" ")}\n\`\`\``;
		expect(estimateReadingMinutes(withCode)).toBe(2);
	});
});

describe("deriveExcerpt", () => {
	test("strips markdown syntax and links to their text", () => {
		const md = "## Hello\n\nRead [the guide](https://x.com) today!";
		expect(deriveExcerpt(md)).toBe("Hello Read the guide today!");
	});

	test("returns null for empty input", () => {
		expect(deriveExcerpt("")).toBeNull();
		expect(deriveExcerpt("   \n  ")).toBeNull();
	});
});

describe("slugify", () => {
	test("lowercases and dashes", () => {
		expect(slugify("Fades & Tapers: A Guide!")).toBe("fades-tapers-a-guide");
	});

	test("strips diacritics via NFKD", () => {
		expect(slugify("Café Barbers")).toBe("cafe-barbers");
	});

	test("caps at 200 chars without trailing dash", () => {
		const slug = slugify("ab ".repeat(200));
		expect(slug.length).toBeLessThanOrEqual(200);
		expect(slug.endsWith("-")).toBe(false);
	});

	test("empty-ish input yields empty string", () => {
		expect(slugify("??? ###")).toBe("");
	});
});
