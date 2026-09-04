// src/data/site.ts
// Site-wide constants: canonical URL, NAP (name-address-phone-hours)
// data. Single source of truth so visible UI and structured data
// (JSON-LD) can never drift apart.
// Photo slot resolution lives in ./images.ts.

export const SITE_URL = "https://unicornbarberacademy.com";

/** Query used for every Google Maps link/embed on the site. */
const MAPS_QUERY =
	"Unicorn Barber Training Academy, House 04, Block F, Main Road, Banasree, Rampura, Dhaka";

/**
 * Neighborhoods around the campus that make up the realistic catchment
 * area. Used by visible copy ("areas we serve") and JSON-LD areaServed —
 * local-pack relevance without pretending to be multiple locations.
 */
export const AREAS_SERVED = [
	"Banasree",
	"Rampura",
	"Aftabnagar",
	"Badda",
	"Khilgaon",
	"Gulshan",
	"Mohakhali",
] as const;

/**
 * Single source of truth for name-address-phone-hours (NAP) data.
 * Used by visible UI (home/contact/footer/legal pages) and structured
 * data (Organization/LocalBusiness JSON-LD) so they can never drift apart.
 * Hours follow the detailed studio schedule shown on /contact.
 */
export const CONTACT = {
	email: "hello@unicornbta.com",
	phoneDisplay: "01337-229944",
	phoneHref: "tel:+8801337229944",
	phoneE164: "+8801337229944",
	whatsapp: "https://wa.me/8801337229944",
	streetAddress: "House 04 (1st Floor), Block F, Main Road",
	addressLocality: "Banasree, Rampura, Dhaka",
	postalCode: "1219",
	addressCountry: "BD",
	addressDisplay:
		"House 04 (1st Floor), Block F, Main Road, Banasree, Rampura, Dhaka 1219, Bangladesh",
	mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`,
	mapsEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&output=embed`,
	hoursSummary: "Sun–Thu, 9AM–9PM · Fri, 9AM–12:30PM & 2:30–9PM · Sat, 9AM–7PM",
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
