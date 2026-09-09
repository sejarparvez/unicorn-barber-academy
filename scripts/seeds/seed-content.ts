// scripts/seed-content.ts — one-time seed of instructors, gallery, and
// testimonials from src/data/*. Safe to re-run (upserts by natural keys).
// Usage: bun scripts/seed-content.ts
import "dotenv/config";
import pg from "pg";
import { GALLERY_ITEMS } from "@/data/gallery";
import { INSTRUCTORS } from "@/data/instructors";

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_SSL_CA
		? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
		: { rejectUnauthorized: true },
	max: 1,
});

const slugify = (s: string) =>
	s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Data file seed numbering is NOT sequential (Shakil ↔ Nusrat are
// swapped): map by roster name explicitly.
const INSTRUCTOR_SEEDS: Record<string, string> = {
	"Rafiul Karim": "unicorn-instructor-1",
	"Farhana Rahman": "unicorn-instructor-2",
	"Imran Hossain": "unicorn-instructor-3",
	"Shakil Ahmed": "unicorn-instructor-5",
	"Nusrat Jahan": "unicorn-instructor-4",
	"Meherun Nesa": "unicorn-instructor-6",
};

// --- Instructors ---
let instructors = 0;
for (const [i, ins] of INSTRUCTORS.entries()) {
	const programSlug = ins.teaches.to.replace("/programs/", "");
	await pool.query(
		`INSERT INTO instructor
			(slug, name, title, track, member_no, years, bio, specialties,
			 image_seed, instagram, program_slug, "lead", quote, sort_order, is_published, updated_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,TRUE,now())
		 ON CONFLICT (slug) DO UPDATE SET
			name = EXCLUDED.name, title = EXCLUDED.title, track = EXCLUDED.track,
			years = EXCLUDED.years, bio = EXCLUDED.bio, specialties = EXCLUDED.specialties,
			image_seed = EXCLUDED.image_seed, program_slug = EXCLUDED.program_slug,
			"lead" = EXCLUDED."lead", quote = EXCLUDED.quote, updated_at = now()`,
		[
			slugify(ins.name),
			ins.name,
			ins.title,
			ins.track,
			ins.memberNo,
			ins.years,
			ins.bio,
			ins.specialties,
			INSTRUCTOR_SEEDS[ins.name] ?? `unicorn-instructor-${i + 1}`,
			ins.instagram,
			programSlug,
			Boolean(ins.lead),
			ins.quote ?? null,
			(i + 1) * 10,
		],
	);
	instructors++;
}

// --- Gallery ---
let gallery = 0;
for (const [i, item] of GALLERY_ITEMS.entries()) {
	const dup = await pool.query(
		"SELECT id FROM gallery_item WHERE category = $1 AND image_seed = $2",
		[item.category, item.seed],
	);
	if (dup.rows.length > 0) continue;
	await pool.query(
		`INSERT INTO gallery_item
			(category, image_seed, image_alt, sort_order, is_published)
		 VALUES ($1, $2, $3, $4, TRUE)`,
		[item.category, item.seed, item.alt, (i + 1) * 10],
	);
	gallery++;
}

// --- Testimonials (currently hardcoded in testimonials.tsx) ---
const TESTIMONIALS = [
	{
		quote:
			"I walked in barely able to hold a clipper. Fourteen weeks later I had a chair waiting for me before graduation.",
		name: "Sadman Alam",
		programSlug: "classic-barbering",
		programName: "Classic Barbering",
		cohort: "2025",
		seed: "unicorn-student-1",
	},
	{
		quote:
			"Bridal & Editorial Makeup gave me an actual portfolio, not just a certificate. I booked my first wedding before I even graduated.",
		name: "Farzana Akter",
		programSlug: "bridal-and-editorial-makeup",
		programName: "Bridal & Editorial Makeup",
		cohort: "2025",
		seed: "unicorn-student-2",
	},
	{
		quote:
			"Business of Barbering paid for itself in my first month. I priced my services wrong for years before this.",
		name: "Shakil Ahmed",
		programSlug: "classic-barbering",
		programName: "Classic Barbering",
		cohort: "2024",
		seed: "unicorn-student-3",
	},
];
let testimonials = 0;
for (const [i, t] of TESTIMONIALS.entries()) {
		const dup = await pool.query(
			"SELECT id FROM testimonial WHERE quote = $1",
			[t.quote],
		);
		if (dup.rows.length === 0) {
			await pool.query(
				`INSERT INTO testimonial
					(quote, name, program_slug, program_name, cohort, image_seed, image_alt, rating, sort_order, is_published)
				 VALUES ($1,$2,$3,$4,$5,$6,$7,5,$8,TRUE)`,
				[t.quote, t.name, t.programSlug, t.programName, t.cohort, t.seed, `${t.name}, ${t.programName} graduate`, (i + 1) * 10],
			);
			testimonials++;
		} else {
			await pool.query(
				"UPDATE testimonial SET image_seed = $2 WHERE id = $1",
				[dup.rows[0].id, t.seed],
			);
		}
}

console.log(`seed-content → instructors ${instructors}, gallery ${gallery}, testimonials ${testimonials}`);
await pool.end();
