import { describe, expect, test } from "bun:test";
import { stringifyJsonLd } from "./jsonld";

describe("stringifyJsonLd", () => {
	test("serializes plain objects as JSON", () => {
		expect(stringifyJsonLd({ name: "UBT" })).toBe('{"name":"UBT"}');
	});

	test("escapes </script> breakouts", () => {
		const out = stringifyJsonLd({
			title: "</script><script>alert(1)</script>",
		});
		expect(out).not.toContain("</script>");
		expect(out).toContain("\\u003c/script\\u003e");
	});

	test("escapes line/paragraph separators", () => {
		const out = stringifyJsonLd({ a: "\u2028\u2029" });
		expect(out).toContain("\\u2028\\u2029");
	});

	test("output stays valid JSON when re-parsed", () => {
		const data = { title: "<b>bold</b>", nested: { q: "</script>x" } };
		expect(JSON.parse(stringifyJsonLd(data))).toEqual(data);
	});
});
