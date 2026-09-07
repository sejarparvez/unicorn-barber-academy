// src/lib/preview-markdown.test.ts
import { describe, expect, test } from "bun:test";
import {
	renderMarkdownPreview,
	transformMarkdown,
} from "@/lib/preview-markdown";

describe("transformMarkdown", () => {
	test("demotes h1 to h2", () => {
		const result = transformMarkdown("# Title");
		expect(result).toContain("<h2");
		expect(result).not.toContain("<h1");
	});

	test("preserves h2 as h2 with anchor id", () => {
		const result = transformMarkdown("## My Section");
		expect(result).toContain("<h2");
		expect(result).toContain('id="my-section"');
	});

	test("adds anchor id to h3", () => {
		const result = transformMarkdown("### Sub Section");
		expect(result).toContain("<h3");
		expect(result).toContain('id="sub-section"');
	});

	test("deduplicates heading ids", () => {
		const md = "## Setup\n\n## Setup\n\n## Setup";
		const result = transformMarkdown(md);
		expect(result).toContain('id="setup"');
		expect(result).toContain('id="setup-2"');
		expect(result).toContain('id="setup-3"');
	});

	test("strips inner HTML from anchor slug", () => {
		const result = transformMarkdown("## <em>Rich</em> Heading");
		expect(result).toContain('id="rich-heading"');
	});

	test("handles GFM tables", () => {
		const md = "| A | B |\n|---|---|\n| 1 | 2 |";
		const result = transformMarkdown(md);
		expect(result).toContain("<table");
		expect(result).toContain("<td");
	});

	test("handles GFM strikethrough", () => {
		const result = transformMarkdown("~~deleted~~");
		expect(result).toContain("<del");
	});

	test("returns empty string for empty input", () => {
		expect(transformMarkdown("")).toBe("");
	});

	test("handles code blocks without adding anchors", () => {
		const md = "```js\nconst x = 1;\n```";
		const result = transformMarkdown(md);
		expect(result).toContain("<code");
		expect(result).not.toContain("id=");
	});
});

describe("renderMarkdownPreview", () => {
	test("produces same output as transformMarkdown", () => {
		const md = "## Hello\n\nSome text.";
		expect(renderMarkdownPreview(md)).toBe(transformMarkdown(md));
	});
});
