import { describe, expect, test } from "bun:test";
import { applicationApprovedEmail, contactInquiryEmail } from "@/server/mail";

describe("email template escaping (XSS/content spoofing)", () => {
	test("visitor name cannot inject markup into the contact email", () => {
		const html = contactInquiryEmail({
			name: "<script>alert(1)</script>",
			email: "attacker@evil.com",
			topicLabel: "Admissions",
			message: "hi",
		});
		expect(html).not.toContain("<script>");
		expect(html).toContain("&lt;script&gt;");
	});

	test("message body is escaped and whitespace-preserved", () => {
		const html = contactInquiryEmail({
			name: "Rafiq",
			email: "r@example.com",
			topicLabel: "Other",
			message: 'Line1\n<b>bold attempt</b> & "quotes"',
		});
		expect(html).not.toContain("<b>bold attempt</b>");
		expect(html).toContain("&lt;b&gt;bold attempt&lt;/b&gt;");
		expect(html).toContain("&amp;");
	});

	test("phone and program render when present", () => {
		const html = contactInquiryEmail({
			name: "A",
			email: "a@b.c",
			phone: "+880 1337-229944",
			topicLabel: "Partnership",
			program: "Classic Barbering",
			message: "hello",
		});
		expect(html).toContain("+880 1337-229944");
		expect(html).toContain("Classic Barbering");
	});
});

describe("application decision emails", () => {
	const data = {
		reference: "ENR-ABC123",
		fullName: 'Farhana "The Blade" Rahman <img src=x onerror=alert(1)>',
		programTitle: "Classic Barbering",
		cohortLabel: "Day cohort",
		startsOnDisplay: "March 1, 2027",
	};

	test("approval mail escapes the applicant name", () => {
		const html = applicationApprovedEmail(data, "https://x.test/dashboard");
		expect(html).not.toContain("<img");
		expect(html).not.toContain("onerror");
		expect(html).toContain("ENR-ABC123");
	});

	test("dashboard link must be absolute (mail clients cannot resolve /dashboard)", () => {
		const html = applicationApprovedEmail(
			data,
			"https://unicornbarberacademy.com/dashboard",
		);
		expect(html).toMatch(
			/href="https:\/\/unicornbarberacademy\.com\/dashboard"/,
		);
	});

	test("query params in links are entity-encoded", () => {
		const html = applicationApprovedEmail(
			data,
			"https://x.test/dashboard?a=1&b=2",
		);
		expect(html).toContain("&amp;b=2");
	});
});
