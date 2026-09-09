// scripts/seed-faqs.ts — one-time seed of home + contact FAQs from the
// hardcoded lists. Safe to re-run (skips existing questions).
// Usage: bun scripts/seed-faqs.ts
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_SSL_CA
		? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
		: { rejectUnauthorized: true },
	max: 1,
});

const FAQS: Array<{ placement: string; question: string; answer: string }> = [
	{ placement: "home", question: "Do I need prior experience to enroll?", answer: "No. Most students start with zero experience. Programs begin with fundamentals before moving into advanced technique." },
	{ placement: "home", question: "Is the curriculum accredited?", answer: "Yes. Our programs follow the NTVQF curriculum standard and are recognised by our partner salons and barbershops for hiring." },
	{ placement: "home", question: "What's included in the kit fee?", answer: "Barbering students receive clippers, shears, and a straight razor. Beauty students receive a professional makeup and styling kit. Both are yours to keep." },
	{ placement: "home", question: "Can I combine barbering and beauty training?", answer: "Yes. Students can enroll in programs from both tracks; many graduates complete a barbering program and a styling or makeup program back to back." },
	{ placement: "home", question: "Do you help graduates find work?", answer: "Yes. We introduce students to our 60+ partner salons and barbershops before graduation, and 97% of graduates are placed within three months." },
	{ placement: "contact", question: "Where exactly is the academy located?", answer: "House 04, Block F, Main Road, Banasree, Rampura, Dhaka 1219 — the academy is on the 1st floor, with the entrance on Main Road. There's a Google map on this page." },
	{ placement: "contact", question: "Which parts of Dhaka do students commute from?", answer: "Most students come from nearby Banasree, Rampura, Aftabnagar, Badda, Khilgaon, Gulshan and Mohakhali — but cohorts regularly include learners from across Dhaka." },
	{ placement: "contact", question: "Do I need an appointment to visit the studio?", answer: "Walk-ins are welcome during studio hours, but booking a visit means an instructor can actually walk you through a cohort in session." },
	{ placement: "contact", question: "How fast will I hear back?", answer: "Most messages get a same-day reply on weekdays, and within 1–2 business days otherwise." },
	{ placement: "contact", question: "Can I call instead of using the form?", answer: "Yes — the phone number above rings the front desk directly during studio hours, and WhatsApp works outside those hours too." },
];

let created = 0;
for (const [i, f] of FAQS.entries()) {
	const dup = await pool.query("SELECT id FROM faq_item WHERE question = $1 AND placement = $2", [f.question, f.placement]);
	if (dup.rows.length === 0) {
		await pool.query(
			"INSERT INTO faq_item (placement, question, answer, sort_order, is_published) VALUES ($1,$2,$3,$4,TRUE)",
			[f.placement, f.question, f.answer, (i + 1) * 10],
		);
		created++;
	}
}
console.log(`seed-faqs → created ${created}`);
await pool.end();
