/* ------------------------------- FAQ ------------------------------- */

import { Reveal, SectionEyebrow } from "@/components/effects";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { stringifyJsonLd } from "@/lib/jsonld";

const FAQS = [
	{
		q: "Do I need prior experience to enroll?",
		a: "No. Most students start with zero experience. Programs begin with fundamentals before moving into advanced technique.",
	},
	{
		q: "Is the curriculum accredited?",
		a: "Yes. Our programs follow the NTVQF curriculum standard and are recognised by our partner salons and barbershops for hiring.",
	},
	{
		q: "What's included in the kit fee?",
		a: "Barbering students receive clippers, shears, and a straight razor. Beauty students receive a professional makeup and styling kit. Both are yours to keep.",
	},
	{
		q: "Can I combine barbering and beauty training?",
		a: "Yes. Students can enroll in programs from both tracks; many graduates complete a barbering program and a styling or makeup program back to back.",
	},
	{
		q: "Do you help graduates find work?",
		a: "Yes. We introduce students to our 60+ partner salons and barbershops before graduation, and 97% of graduates are placed within three months.",
	},
];

const FAQ_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: FAQS.map((f) => ({
		"@type": "Question",
		name: f.q,
		acceptedAnswer: { "@type": "Answer", text: f.a },
	})),
};

export default function Faq() {
	return (
		<section
			className="section-light border-t border-border bg-background px-4 py-24 lg:px-10"
			aria-labelledby="faq-heading"
		>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(FAQ_JSON_LD) }}
			/>
			<div className="mx-auto max-w-3xl">
				<SectionEyebrow guard="6" title="Frequently Asked" id="faq-heading" />

				<Accordion className="mt-10">
					{FAQS.map((item, i) => (
						<Reveal key={item.q} delay={i * 0.05}>
							<AccordionItem
								value={`item-${i}`}
								className="border-border py-1 first:border-t"
							>
								<AccordionTrigger className="py-4 text-base font-medium text-foreground hover:no-underline [&>svg]:text-primary">
									{item.q}
								</AccordionTrigger>
								<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
									{item.a}
								</AccordionContent>
							</AccordionItem>
						</Reveal>
					))}
				</Accordion>
			</div>
		</section>
	);
}
