// src/data/site.ts
// Site-wide constants: canonical URL, NAP (name-address-phone-hours)
// data. Single source of truth so visible UI and structured data
// (JSON-LD) can never drift apart.
// Photo slot resolution lives in ./images.ts.

export const SITE_URL = "https://unicornbarberacademy.com";

/**
 * Single source of truth for name-address-phone-hours (NAP) data.
 * Used by visible UI (home/contact/footer/legal pages) and structured
 * data (Organization/LocalBusiness JSON-LD) so they can never drift apart.
 * Hours follow the detailed studio schedule shown on /contact.
 */
export const CONTACT = {
	email: "hello@unicornbta.com",
	phoneDisplay: "+880 1234-567890",
	phoneHref: "tel:+8801234567890",
	phoneE164: "+8801234567890",
	whatsapp: "https://wa.me/8801234567890",
	streetAddress: "123 Fade Street",
	addressLocality: "Gulshan, Dhaka",
	postalCode: "1212",
	addressCountry: "BD",
	addressDisplay: "123 Fade Street, Gulshan, Dhaka 1212, Bangladesh",
	hoursSummary: "Sun–Thu, 9AM–9PM · Sat, 9AM–7PM",
	hours: [
		{ day: "Sunday – Thursday", time: "9:00 AM – 9:00 PM" },
		{ day: "Friday", time: "9:00 AM – 12:30 PM, 2:30 PM – 9:00 PM" },
		{ day: "Saturday", time: "9:00 AM – 7:00 PM" },
	],
};

/** schema.org OpeningHoursSpecification matching {@link CONTACT.hours}. */
export const OPENING_HOURS_SPEC = [
	{
		"@type": "OpeningHoursSpecification",
		dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
		opens: "09:00",
		closes: "21:00",
	},
	{
		"@type": "OpeningHoursSpecification",
		dayOfWeek: ["Friday"],
		opens: "09:00",
		closes: "12:30",
	},
	{
		"@type": "OpeningHoursSpecification",
		dayOfWeek: ["Friday"],
		opens: "14:30",
		closes: "21:00",
	},
	{
		"@type": "OpeningHoursSpecification",
		dayOfWeek: ["Saturday"],
		opens: "09:00",
		closes: "19:00",
	},
];
