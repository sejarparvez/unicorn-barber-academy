/* ------------------------------- FAQ ------------------------------- */

import { Reveal, SectionEyebrow } from "@/components/effects";
import { JsonLdScript } from "@/components/jsonld-script";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqView } from "@/lib/content";

function faqJsonLd(faqs: FaqView[]) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((f) => ({
			"@type": "Question",
			name: f.question,
			acceptedAnswer: { "@type": "Answer", text: f.answer },
		})),
	};
}

export default function Faq({ items }: { items: FaqView[] }) {
	return (
		<section
			className="section-light border-t border-border bg-background px-4 py-24 lg:px-10"
			aria-labelledby="faq-heading"
		>
			<JsonLdScript data={faqJsonLd(items)} />
			<div className="mx-auto max-w-3xl">
				<SectionEyebrow title="Frequently Asked" id="faq-heading" />

				<Accordion className="mt-10">
					{items.map((item, i) => (
						<Reveal key={item.question} delay={i * 0.05}>
							<AccordionItem
								value={`item-${i}`}
								className="border-border py-1 first:border-t"
							>
								<AccordionTrigger className="py-4 text-base font-medium text-foreground hover:no-underline [&>svg]:text-primary">
									{item.question}
								</AccordionTrigger>
								<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
									{item.answer}
								</AccordionContent>
							</AccordionItem>
						</Reveal>
					))}
				</Accordion>
			</div>
		</section>
	);
}
