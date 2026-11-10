import { FinalCta } from "@/components/effects";
import { JsonLdScript } from "@/components/jsonld-script";
import { SITE_URL } from "@/data/site";
import type { InstructorView } from "@/lib/content";
import type { SiteContact } from "@/lib/settings";
import { useSite } from "@/lib/site-context";
import AboutHero from "./about-hero";
import LedBy from "./led-by";
import OurApproach from "./our-approach";
import OurStory from "./our-story";
import TheGuild from "./the-guild";

const BREADCRUMB_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
		{
			"@type": "ListItem",
			position: 2,
			name: "About",
			item: `${SITE_URL}/about`,
		},
	],
};

const ORG_JSON_LD_BASE = {
	"@context": "https://schema.org",
	// Same @id as the footer's LocalBusiness block — one merged entity for
	// search engines, not two competing organizations.
	"@id": `${SITE_URL}/#academy`,
	"@type": ["EducationalOrganization", "LocalBusiness"],
	name: "Unicorn Barber Training Academy",
	url: SITE_URL,
	logo: `${SITE_URL}/logo.png`,
	foundingDate: "2016",
};

/** Organization block with admin-editable address/phone/socials merged in. */
function orgJsonLd(
	contact: SiteContact,
	social: {
		instagram: string;
		facebook: string;
		youtube: string;
		tiktok: string;
		x: string;
	},
) {
	return {
		...ORG_JSON_LD_BASE,
		sameAs: [
			social.instagram,
			social.facebook,
			social.youtube,
			social.tiktok,
			social.x,
		].filter(Boolean),
		address: {
			"@type": "PostalAddress",
			streetAddress: contact.streetAddress,
			addressLocality: contact.addressLocality,
			postalCode: contact.postalCode,
			addressCountry: contact.addressCountry,
		},
		contactPoint: {
			"@type": "ContactPoint",
			telephone: contact.phoneE164,
			contactType: "admissions",
			availableLanguage: ["Bengali", "English"],
		},
	};
}

const ABOUT_PAGE_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "AboutPage",
	name: "About Unicorn Barber Training Academy",
	url: `${SITE_URL}/about`,
	mainEntity: { "@id": `${SITE_URL}/#academy` },
};

export default function AboutPage({
	instructors,
}: {
	instructors: InstructorView[];
}) {
	const { contact, social } = useSite();
	return (
		<main>
			<JsonLdScript data={BREADCRUMB_JSON_LD} />
			<JsonLdScript data={orgJsonLd(contact, social)} />
			<JsonLdScript data={ABOUT_PAGE_JSON_LD} />
			<AboutHero instructors={instructors} />
			<OurStory />
			<OurApproach />
			<LedBy instructors={instructors} />
			<TheGuild />
			<FinalCta
				title="Want to see it for yourself?"
				accent="Book a studio visit."
				subtitle="Walk the floor, meet an instructor, and see a cohort in action. No pressure — just a proper look at what we do."
				ctaLabel="SCHEDULE A VISIT"
				ctaTo="/contact"
			/>
		</main>
	);
}
