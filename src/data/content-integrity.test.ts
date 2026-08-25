import { describe, expect, test } from "bun:test";
import { INSTRUCTORS } from "@/data/instructors";
import { MEDIA_FEATURES, MEDIA_TYPES, type MediaFeature } from "@/data/media";
import { ALL_PROGRAMS } from "@/data/programs";
import { AREAS_SERVED, CONTACT, SITE_URL } from "@/data/site";
import { SOCIAL_URLS } from "@/lib/social";

describe("programs data", () => {
	test("slugs are unique and url-safe", () => {
		const slugs = ALL_PROGRAMS.map((p) => p.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		for (const slug of slugs) {
			expect(slug).toMatch(/^[a-z0-9-]+$/);
		}
	});

	test("every program links to its own detail route", () => {
		for (const p of ALL_PROGRAMS) {
			expect(p.to).toBe(`/programs/${p.slug}`);
			expect(p.title.length).toBeGreaterThan(0);
			expect(p.description.length).toBeGreaterThan(0);
		}
	});

	test("tracks are only barbering or beauty", () => {
		for (const p of ALL_PROGRAMS) {
			expect(["barbering", "beauty"]).toContain(p.track);
		}
	});
});

describe("instructors data", () => {
	test("every instructor teaches an existing program", () => {
		const routes = new Set(ALL_PROGRAMS.map((p) => p.to));
		for (const instructor of INSTRUCTORS) {
			expect(routes.has(instructor.teaches.to)).toBe(true);
			expect(instructor.name.length).toBeGreaterThan(0);
		}
	});

	test("instagram links point at the academy handle (not the bare domain)", () => {
		for (const instructor of INSTRUCTORS) {
			expect(instructor.instagram.startsWith(SOCIAL_URLS.instagram)).toBe(true);
		}
	});
});

describe("NAP contact data", () => {
	test("phone fields agree with each other", () => {
		const digits = CONTACT.phoneDisplay.replace(/\D/g, "");
		// Display keeps the national leading 0; E.164 drops it for 880.
		expect(CONTACT.phoneE164).toBe(`+880${digits.replace(/^0/, "")}`);
		expect(CONTACT.phoneHref).toBe(`tel:${CONTACT.phoneE164}`);
		expect(CONTACT.whatsapp).toContain(digits.replace(/^0/, "880"));
	});

	test("BD mobile format 01XXXXXXXXX (11 digits)", () => {
		expect(CONTACT.phoneDisplay.replace(/\D/g, "")).toMatch(/^01\d{9}$/);
	});

	test("address is the real campus (Banasree, Rampura)", () => {
		expect(CONTACT.addressLocality).toContain("Banasree");
		expect(CONTACT.addressLocality).toContain("Rampura");
		expect(CONTACT.addressDisplay).toContain("Banasree");
		expect(CONTACT.streetAddress.toLowerCase()).toContain("house");
	});

	test("areas served include the campus neighborhoods", () => {
		expect(AREAS_SERVED).toContain("Banasree");
		expect(AREAS_SERVED).toContain("Rampura");
	});
});

describe("social URLs", () => {
	test("all platforms are absolute https with a path/handle", () => {
		for (const [platform, url] of Object.entries(SOCIAL_URLS)) {
			expect(url.startsWith("https://"), platform).toBe(true);
			expect(new URL(url).pathname.length, platform).toBeGreaterThan(1);
		}
	});

	test("no placeholder-only profiles", () => {
		expect(SOCIAL_URLS.instagram).not.toBe("https://www.instagram.com");
		expect(SOCIAL_URLS.facebook).toContain("unicornbarberacademy");
		expect(SOCIAL_URLS.tiktok).toContain("unicorntrainingacademy");
		expect(SOCIAL_URLS.x).toContain("unicorntraining");
	});
});

describe("site URL", () => {
	test("is production https origin without trailing slash", () => {
		expect(SITE_URL).toMatch(/^https:\/\/[a-z.-]+$/);
	});
});

describe("media features data", () => {
	test("every entry is complete and well-formed", () => {
		for (const feature of MEDIA_FEATURES as MediaFeature[]) {
			expect(feature.title.length, feature.url).toBeGreaterThan(0);
			expect(feature.outlet.length, feature.url).toBeGreaterThan(0);
			expect(feature.url.startsWith("https://"), feature.title).toBe(true);
			expect(MEDIA_TYPES).toContain(feature.type);
			expect(feature.publishedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(Number.isNaN(Date.parse(feature.publishedOn)), feature.title).toBe(
				false,
			);
		}
	});

	test("urls are unique", () => {
		const urls = MEDIA_FEATURES.map((f) => f.url);
		expect(new Set(urls).size).toBe(urls.length);
	});
});
