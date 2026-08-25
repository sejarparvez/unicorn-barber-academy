import { describe, expect, test } from "bun:test";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown sanitization", () => {
	test("renders basic markdown", () => {
		const html = renderMarkdown("**bold** and _italic_");
		expect(html).toContain("<strong>bold</strong>");
		expect(html).toContain("<em>italic</em>");
	});

	test("strips script tags entirely", () => {
		const html = renderMarkdown("hello <script>alert(1)</script> world");
		expect(html).not.toContain("<script");
		expect(html).not.toContain("alert(1)");
	});

	test("strips event handlers", () => {
		const html = renderMarkdown('<img src="x.png" onerror="alert(1)">');
		expect(html).not.toContain("onerror");
	});

	test("blocks javascript: URLs", () => {
		const html = renderMarkdown("[click me](javascript:alert(1))");
		expect(html).not.toContain("javascript:");
	});

	test("iframe/object/embed are not allowed tags", () => {
		const html = renderMarkdown(
			'<iframe src="https://evil.com"></iframe><object></object><embed>',
		);
		expect(html).not.toContain("<iframe");
		expect(html).not.toContain("<object");
		expect(html).not.toContain("<embed");
	});

	test("style attribute is stripped (CSS injection)", () => {
		const html = renderMarkdown('<span style="position:fixed">x</span>');
		expect(html).not.toContain("style=");
	});
});

describe("renderMarkdown link hygiene", () => {
	test("absolute external links get rel hygiene", () => {
		const html = renderMarkdown("[site](https://example.com)");
		expect(html).toMatch(/rel="noopener noreferrer nofollow"/);
	});

	test("protocol-relative links get rel hygiene too (regression)", () => {
		const html = renderMarkdown("[evil](//evil.com)");
		expect(html).toMatch(/rel="noopener noreferrer nofollow"/);
	});

	test("relative internal links keep target off / no forced rel", () => {
		const html = renderMarkdown("[internal](/programs/classic-barbering)");
		expect(html).not.toContain('rel="noopener');
		expect(html).not.toMatch(/target="_blank"/);
	});
});

describe("renderMarkdown structure", () => {
	test("authored h1 is demoted to h2 (page keeps a single h1)", () => {
		const html = renderMarkdown("# Big Title\n\n## Section");
		expect(html).not.toContain("<h1");
		expect(html).toContain('id="big-title">Big Title</h2>');
	});

	test("h2/h3 receive anchor ids; duplicates get -2 suffixes", () => {
		const html = renderMarkdown("## Setup\n\ntext\n\n## Setup");
		expect(html).toContain('id="setup"');
		expect(html).toContain('id="setup-2"');
	});

	test("anchor ids only contain url-safe characters", () => {
		const html = renderMarkdown("## Fades & Tapers: 101!");
		expect(html).toMatch(/<h2 id="[a-z0-9-]+">/);
	});

	test("images gain lazy loading + async decoding", () => {
		const html = renderMarkdown("![alt text](/img.png)");
		expect(html).toContain('loading="lazy"');
		expect(html).toContain('decoding="async"');
	});
});
