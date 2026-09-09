// src/lib/settings.ts
// Client-safe site-settings domain: key definitions, derivation of display
// fields (tel:/WhatsApp/Maps links) from admin-editable base values, and the
// resolved shape consumed by UI + JSON-LD. Mirrors data/site.ts CONTACT so
// swaps are mechanical. DB rows overlay code defaults per-key (see
// src/server/settings-db.ts) — an empty table renders byte-identical.
import { AREAS_SERVED, CONTACT } from "@/data/site";

export const SETTING_KEYS = [
	"contact_email",
	"contact_phone",
	"address_street",
	"address_locality",
	"address_postal",
	"address_country",
	"hours_summary",
	"hours_detail",
	"areas_served",
	"announcement_text",
	"announcement_to",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export type SettingLabels = Record<SettingKey, { label: string; hint: string }>;

export const SETTING_LABELS: SettingLabels = {
	contact_email: {
		label: "Contact email",
		hint: "Shown on contact page, footer, legal pages.",
	},
	contact_phone: {
		label: "Phone (digits)",
		hint: "e.g. 01337229944 — display, tel:, and WhatsApp links derive from this.",
	},
	address_street: {
		label: "Street address",
		hint: "e.g. House 04 (1st Floor), Block F, Main Road",
	},
	address_locality: {
		label: "Locality",
		hint: "e.g. Banasree, Rampura, Dhaka",
	},
	address_postal: { label: "Postal code", hint: "e.g. 1219" },
	address_country: { label: "Country", hint: "Full name, e.g. Bangladesh" },
	hours_summary: {
		label: "Hours summary",
		hint: "One line, e.g. Saturday – Thursday, 9AM–9PM",
	},
	hours_detail: {
		label: "Hours detail",
		hint: 'One per line as "Days | Time", e.g. "Saturday – Thursday | 9:00 AM – 9:00 PM"',
	},
	areas_served: {
		label: "Areas served",
		hint: "Comma-separated neighborhoods.",
	},
	announcement_text: {
		label: "Announcement banner",
		hint: "Empty hides the homepage banner.",
	},
	announcement_to: {
		label: "Announcement link",
		hint: "Optional path, e.g. /enroll. Empty = no link.",
	},
};

/** Base values: what admin edits. Defaults mirror data/site.ts. */
export function defaultBaseValues(): Record<SettingKey, string> {
	return {
		contact_email: CONTACT.email,
		contact_phone: "01337229944",
		address_street: CONTACT.streetAddress,
		address_locality: CONTACT.addressLocality,
		address_postal: CONTACT.postalCode,
		address_country: "Bangladesh",
		hours_summary: CONTACT.hoursSummary,
		hours_detail: CONTACT.hours.map((h) => `${h.day} | ${h.time}`).join("\n"),
		areas_served: [...AREAS_SERVED].join(", "),
		announcement_text: "",
		announcement_to: "",
	};
}

export type SiteContact = typeof CONTACT;
export type SiteAnnouncement = { text: string; to: string | null } | null;

export type ResolvedSettings = {
	contact: SiteContact;
	areasServed: string[];
	announcement: SiteAnnouncement;
};

/** BD phone formatting: 11-digit 01… numbers → 01337-229944 style. */
export function formatPhoneDisplay(digits: string): string {
	if (/^01\d{9}$/.test(digits))
		return `${digits.slice(0, 5)}-${digits.slice(5)}`;
	return digits;
}

/** Normalize to E164: 01… → +880…, 880… → +…, else +digits. */
export function toE164(digits: string): string {
	if (/^01\d{9}$/.test(digits)) return `+880${digits.slice(1)}`;
	if (/^880\d{9,10}$/.test(digits)) return `+${digits}`;
	return `+${digits}`;
}

/** Resolve merged base values (DB over defaults) into the CONTACT-shaped
    object every consumer already uses. Pure — unit-testable. */
export function resolveSettings(
	base: Record<SettingKey, string>,
): ResolvedSettings {
	const defaults = defaultBaseValues();
	const v = (key: SettingKey): string => {
		const raw = (base[key] ?? "").trim();
		return raw || defaults[key];
	};

	const phoneDigits =
		v("contact_phone").replace(/[^0-9]/g, "") || "01337229944";
	const e164 = toE164(phoneDigits);
	const street = v("address_street");
	const locality = v("address_locality");
	const postal = v("address_postal");
	const country = v("address_country");
	// Maps queries omit floor/unit details in parentheses ("House 04 (1st
	// Floor)" → "House 04") — geocoders match street addresses better.
	const mapsStreet = street
		.replace(/\s*\([^)]*\)\s*/g, " ")
		.replace(/\s+/g, " ")
		.replace(/\s+,/g, ",")
		.trim();
	const mapsQuery = `Unicorn Barber Training Academy, ${mapsStreet}, ${locality}`;
	const areas = v("areas_served")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	const hours = v("hours_detail")
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [day, ...time] = line.split("|");
			return { day: (day ?? "").trim() || line, time: time.join("|").trim() };
		})
		.filter((h) => h.time);
	const announcementText = (base.announcement_text ?? "").trim();
	const announcementTo = (base.announcement_to ?? "").trim();

	return {
		contact: {
			email: v("contact_email"),
			phoneDisplay: formatPhoneDisplay(phoneDigits),
			phoneHref: `tel:${e164}`,
			phoneE164: e164,
			whatsapp: `https://wa.me/${e164.replace("+", "")}`,
			streetAddress: street,
			addressLocality: locality,
			postalCode: postal,
			addressCountry: country === "Bangladesh" ? "BD" : country,
			addressDisplay: `${street}, ${locality} ${postal}, ${country}`,
			mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`,
			mapsEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`,
			hoursSummary: v("hours_summary"),
			hours:
				hours.length > 0
					? hours
					: defaults.hours_detail.split("\n").map((line) => {
							const [day, ...time] = line.split("|");
							return { day: day.trim(), time: time.join("|").trim() };
						}),
		},
		areasServed: areas.length > 0 ? areas : [...AREAS_SERVED],
		announcement:
			announcementText.length > 0
				? { text: announcementText, to: announcementTo || null }
				: null,
	};
}
