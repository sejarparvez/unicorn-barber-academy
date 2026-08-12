import {
	IconArrowRight,
	IconBrandInstagram,
	IconBriefcase,
	IconClockHour4,
	IconMapPin,
	IconPhone,
	IconQuote,
	IconScissors,
	IconSparkles,
	IconUsers,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SITE_URL = "https://unicornbta.com";

export const Route = createFileRoute("/")({
	component: Home,
	head: () => ({
		meta: [
			{
				title:
					"Unicorn Barber Training Academy | Barbering & Beauty Courses in Dhaka",
			},
			{
				name: "description",
				content:
					"Hands-on barbering and beauty & cosmetology training in Dhaka. Working-professional instructors, full kit included, job placement support. Enrollment open for the Fall cohort.",
			},
			{ property: "og:title", content: "Unicorn Barber Training Academy" },
			{
				property: "og:description",
				content:
					"Hands-on barbering and beauty & cosmetology training taught by working professionals. Enrollment open for the Fall cohort.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: SITE_URL },
			{ name: "twitter:card", content: "summary_large_image" },
		],
		links: [{ rel: "canonical", href: SITE_URL }],
	}),
});

const pic = (seed: string, w: number, h: number) =>
	`https://picsum.photos/seed/${seed}/${w}/${h}`;

function Home() {
	return (
		<>
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-primary focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:text-secondary-foreground"
			>
				Skip to content
			</a>
			<main id="main-content">
				<Hero />
				<TrustBar />
				<Stats />
				<WhyUnicorn />
				<Programs />
				<StudentLife />
				<Instructors />
				<Testimonials />
				<Faq />
				<VisitUs />
				<FinalCta />
			</main>
		</>
	);
}

/* ----------------------------- Hero ----------------------------- */
/* Split composition: the academy's two disciplines, divided by the
   brand's signature gold line run the full height of the hero. */

function Hero() {
	return (
		<section
			className="relative overflow-hidden bg-secondary text-secondary-foreground"
			aria-labelledby="hero-heading"
		>
			<div className="grid grid-cols-1 lg:grid-cols-2">
				<div className="relative h-[46vh] lg:h-[92vh]">
					<img
						src={pic("unicorn-hero-barbering", 1200, 1400)}
						alt="Barbering student practicing a fade haircut on a mannequin at Unicorn Barber Training Academy"
						className="h-full w-full object-cover opacity-60"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent lg:bg-gradient-to-r" />
					<p className="absolute left-6 top-6 text-[11px] tracking-[0.28em] text-secondary-foreground/70 lg:left-10 lg:top-10">
						BARBERING
					</p>
				</div>
				<div className="relative h-[46vh] border-t border-primary/20 lg:h-[92vh] lg:border-t-0">
					<img
						src={pic("unicorn-hero-beauty", 1200, 1400)}
						alt="Beauty and cosmetology student applying bridal makeup during a practical session"
						className="h-full w-full object-cover opacity-60"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent lg:bg-gradient-to-l" />
					<p className="absolute right-6 top-6 text-right text-[11px] tracking-[0.28em] text-secondary-foreground/70 lg:right-10 lg:top-10">
						BEAUTY &amp; COSMETOLOGY
					</p>
				</div>
			</div>

			{/* Full-height gold seam, desktop only */}
			<div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary to-transparent lg:block" />

			{/* Centered overlay content */}
			<div className="absolute inset-0 flex items-center justify-center px-6">
				<div className="mx-auto max-w-2xl text-center">
					<p className="flex items-center justify-center gap-3 text-[11px] tracking-[0.32em] text-primary">
						<span className="h-px w-8 bg-primary/70" />
						ENROLLMENT OPEN &mdash; FALL COHORT
						<span className="h-px w-8 bg-primary/70" />
					</p>
					<h1
						id="hero-heading"
						className="mt-6 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl"
						style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
					>
						Two crafts.
						<br />
						<span className="bg-gradient-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-transparent">
							One academy.
						</span>
					</h1>
					<p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-secondary-foreground/75 sm:text-lg">
						Hands-on barbering and beauty training, taught by working
						professionals. Pick a path, or master both.
					</p>

					<div className="mt-9 flex justify-center">
						<Link
							to="/enroll"
							className={cn(
								buttonVariants({ variant: "outline" }),
								"rounded-none border-primary bg-secondary/60 px-8 py-6 text-[12px] font-semibold tracking-[0.16em] text-primary backdrop-blur-sm hover:bg-primary hover:text-primary-foreground",
							)}
						>
							ENROLL NOW
						</Link>
					</div>

					<div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] font-medium tracking-[0.12em]">
						<Link
							to="/programs/barbering"
							className="group inline-flex items-center gap-1.5 text-secondary-foreground/70 hover:text-primary"
						>
							EXPLORE BARBERING
							<IconArrowRight
								className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
								stroke={1.75}
							/>
						</Link>
						<Link
							to="/programs/beauty"
							className="group inline-flex items-center gap-1.5 text-secondary-foreground/70 hover:text-primary"
						>
							EXPLORE BEAUTY &amp; COSMETOLOGY
							<IconArrowRight
								className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
								stroke={1.75}
							/>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

/* ---------------------------- Trust bar ---------------------------- */
/* Placeholder credentials — replace with your academy's actual
   registration/accreditation details before launch. */

const CREDENTIALS = [
	"Nationally Registered Training Provider",
	"NTVQF Certified Curriculum",
	"Member, Bangladesh Barbers & Beauticians Guild",
];

function TrustBar() {
	return (
		<section
			className="border-b border-border bg-background px-6 py-6"
			aria-label="Accreditation"
		>
			<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3">
				{CREDENTIALS.map((c) => (
					<span
						key={c}
						className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground"
					>
						{c.toUpperCase()}
					</span>
				))}
			</div>
		</section>
	);
}

/* ----------------------------- Stats ----------------------------- */

const STATS = [
	{ value: "1,200+", label: "Graduates Placed" },
	{ value: "97%", label: "Job Placement Rate" },
	{ value: "12", label: "Years Training Barbers & Beauticians" },
	{ value: "60+", label: "Partner Salons & Barbershops" },
];

function Stats() {
	return (
		<section
			className="bg-secondary text-secondary-foreground"
			aria-label="Academy statistics"
		>
			<div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4 lg:px-10">
				{STATS.map((stat, i) => (
					<div
						key={stat.label}
						className={cn(
							"flex flex-col items-center gap-2 border-primary/15 px-6 py-12 text-center",
							i % 2 === 0 ? "border-r" : "",
							i < 2 ? "border-b lg:border-b-0" : "",
							i > 0 && "lg:border-l",
						)}
					>
						<span
							className="bg-gradient-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-4xl text-transparent sm:text-5xl"
							style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
						>
							{stat.value}
						</span>
						<span className="text-[11px] tracking-[0.2em] text-secondary-foreground/55">
							{stat.label.toUpperCase()}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}

/* --------------------------- Why Unicorn --------------------------- */

const FEATURES = [
	{
		icon: IconScissors,
		title: "Taught by Working Professionals",
		description:
			"Every instructor still works a chair or a station. You learn what's current, not what's textbook.",
	},
	{
		icon: IconBriefcase,
		title: "Full Kit Included",
		description:
			"Clippers and shears, or a professional makeup and styling kit — yours from week one. No extra spend.",
	},
	{
		icon: IconUsers,
		title: "Job Placement Support",
		description:
			"Sixty partner salons and barbershops hire straight out of our cohorts.",
	},
	{
		icon: IconClockHour4,
		title: "Day & Evening Cohorts",
		description:
			"Train around a job or family. Same curriculum, same instructors, your schedule.",
	},
];

function SectionEyebrow({
	guard,
	title,
	id,
}: {
	guard: string;
	title: string;
	id: string;
}) {
	return (
		<div className="flex items-center gap-4">
			<span
				className="h-6 w-px bg-gradient-to-b from-[#F4C430] via-primary to-[#8B6914]"
				aria-hidden="true"
			/>
			<div>
				<p className="text-[11px] tracking-[0.28em] text-primary">
					GUARD &#8470; {guard}
				</p>
				<h2
					id={id}
					className="mt-1 text-3xl text-foreground sm:text-4xl"
					style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
				>
					{title}
				</h2>
			</div>
		</div>
	);
}

function WhyUnicorn() {
	return (
		<section
			className="bg-background px-6 py-24 lg:px-10"
			aria-labelledby="why-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="1" title="Why Unicorn" id="why-heading" />
				<div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-border sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map((feature) => (
						<div
							key={feature.title}
							className="bg-background p-8 transition-colors hover:bg-accent"
						>
							<feature.icon
								className="h-7 w-7 text-primary"
								stroke={1.5}
								aria-hidden="true"
							/>
							<h3 className="mt-5 text-base font-semibold text-foreground">
								{feature.title}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- Programs ----------------------------- */

type Program = {
	title: string;
	duration: string;
	description: string;
	image: string;
	alt: string;
	to: string;
};

const BARBERING_PROGRAMS: Program[] = [
	{
		title: "Classic Barbering",
		duration: "14 weeks",
		description:
			"Clipper work, straight-razor shaves, and the fundamentals every chair depends on.",
		image: pic("unicorn-program-classic", 800, 900),
		alt: "Barbering student giving a classic clipper cut in the training studio",
		to: "/programs/classic-barbering",
	},
	{
		title: "Fades & Tapers",
		duration: "6 weeks",
		description:
			"Skin fades, tapers, and the blending techniques that separate a good cut from a great one.",
		image: pic("unicorn-program-fades", 800, 900),
		alt: "Close-up of a skin fade haircut being finished with clippers",
		to: "/programs/fades-and-tapers",
	},
	{
		title: "Beard Sculpting",
		duration: "4 weeks",
		description:
			"Line-ups, shape design, and the hot-towel service clients pay extra for.",
		image: pic("unicorn-program-beard", 800, 900),
		alt: "Barber shaping a client's beard with a straight razor",
		to: "/programs/beard-sculpting",
	},
];

const BEAUTY_PROGRAMS: Program[] = [
	{
		title: "Cosmetology Fundamentals",
		duration: "16 weeks",
		description:
			"Skincare, makeup application, and hairstyling basics — the foundation for every beauty career.",
		image: pic("unicorn-program-cosmetology", 800, 900),
		alt: "Beauty student practicing a skincare facial treatment",
		to: "/programs/cosmetology-fundamentals",
	},
	{
		title: "Hair Styling & Colouring",
		duration: "8 weeks",
		description:
			"Cuts, colour theory, and chemical treatments for a full-service styling chair.",
		image: pic("unicorn-program-hairstyling", 800, 900),
		alt: "Student applying hair colour treatment to a mannequin head",
		to: "/programs/hair-styling-and-colouring",
	},
	{
		title: "Bridal & Editorial Makeup",
		duration: "5 weeks",
		description:
			"Special-occasion makeup and editorial looks, built for weddings and photo shoots.",
		image: pic("unicorn-program-bridal-makeup", 800, 900),
		alt: "Student applying bridal makeup to a model during a practical class",
		to: "/programs/bridal-and-editorial-makeup",
	},
];

const ALL_PROGRAMS_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "ItemList",
	itemListElement: [...BARBERING_PROGRAMS, ...BEAUTY_PROGRAMS].map((p, i) => ({
		"@type": "Course",
		position: i + 1,
		name: p.title,
		description: p.description,
		provider: {
			"@type": "EducationalOrganization",
			name: "Unicorn Barber Training Academy",
			sameAs: SITE_URL,
		},
		url: `${SITE_URL}${p.to}`,
	})),
};

function ProgramCard({ program }: { program: Program }) {
	return (
		<Link to={program.to} className="group block">
			<div className="relative aspect-[4/5] overflow-hidden">
				<img
					src={program.image}
					alt={program.alt}
					className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
					loading="lazy"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
				<span className="absolute bottom-4 left-4 border border-primary/50 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.18em] text-primary backdrop-blur-sm">
					{program.duration.toUpperCase()}
				</span>
			</div>
			<h4 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">
				{program.title}
			</h4>
			<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
				{program.description}
			</p>
		</Link>
	);
}

function Programs() {
	return (
		<section
			className="border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="programs-heading"
		>
			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(ALL_PROGRAMS_JSON_LD),
				}}
			/>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<SectionEyebrow guard="2" title="Programs" id="programs-heading" />
					<Link
						to="/programs"
						className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.16em] text-muted-foreground hover:text-primary"
					>
						VIEW ALL PROGRAMS
						<IconArrowRight
							className="h-4 w-4 transition-transform group-hover:translate-x-1"
							stroke={1.75}
						/>
					</Link>
				</div>

				{/* Barbering track */}
				<div className="mt-14">
					<div className="flex items-center gap-2">
						<IconScissors
							className="h-4 w-4 text-primary"
							stroke={1.75}
							aria-hidden="true"
						/>
						<h3 className="text-[12px] font-semibold tracking-[0.24em] text-primary">
							BARBERING TRACK
						</h3>
					</div>
					<div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{BARBERING_PROGRAMS.map((program) => (
							<ProgramCard key={program.title} program={program} />
						))}
					</div>
				</div>

				{/* Beauty & cosmetology track */}
				<div className="mt-16">
					<div className="flex items-center gap-2">
						<IconSparkles
							className="h-4 w-4 text-primary"
							stroke={1.75}
							aria-hidden="true"
						/>
						<h3 className="text-[12px] font-semibold tracking-[0.24em] text-primary">
							BEAUTY &amp; COSMETOLOGY TRACK
						</h3>
					</div>
					<div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{BEAUTY_PROGRAMS.map((program) => (
							<ProgramCard key={program.title} program={program} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

/* --------------------------- Student Life --------------------------- */

const GALLERY_ITEMS = [
	{
		seed: "unicorn-gallery-1",
		alt: "Barbering students practicing fades on mannequin heads",
	},
	{
		seed: "unicorn-gallery-2",
		alt: "Close-up of a professional makeup kit laid out for class",
	},
	{
		seed: "unicorn-gallery-3",
		alt: "Instructor demonstrating a straight-razor technique",
	},
	{
		seed: "unicorn-gallery-4",
		alt: "Beauty student styling hair during a practical session",
	},
	{
		seed: "unicorn-gallery-5",
		alt: "Graduating cohort posing together at the academy",
	},
	{
		seed: "unicorn-gallery-6",
		alt: "Row of barber chairs and styling stations in the training studio",
	},
];

function StudentLife() {
	return (
		<section
			className="border-t border-primary/15 bg-secondary px-6 py-24 text-secondary-foreground lg:px-10"
			aria-labelledby="academy-heading"
		>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<div className="flex items-center gap-4">
						<span
							className="h-6 w-px bg-gradient-to-b from-[#F4C430] via-primary to-[#8B6914]"
							aria-hidden="true"
						/>
						<div>
							<p className="text-[11px] tracking-[0.28em] text-primary">
								GUARD &#8470; 3
							</p>
							<h2
								id="academy-heading"
								className="mt-1 text-3xl sm:text-4xl"
								style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
							>
								Inside the Academy
							</h2>
						</div>
					</div>
					<Link
						to="/gallery"
						className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.16em] text-secondary-foreground/70 hover:text-primary"
					>
						SEE FULL GALLERY
						<IconArrowRight
							className="h-4 w-4 transition-transform group-hover:translate-x-1"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-6">
					{GALLERY_ITEMS.map((item, i) => (
						<div
							key={item.seed}
							className={cn(
								"group relative overflow-hidden",
								i === 0 || i === 3 ? "col-span-2 row-span-2" : "col-span-1",
							)}
						>
							<img
								src={pic(item.seed, 700, 700)}
								alt={item.alt}
								loading="lazy"
								className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

/* --------------------------- Instructors --------------------------- */

const INSTRUCTORS = [
	{
		name: "Rafiul Karim",
		title: "Lead Instructor, Barbering",
		image: pic("unicorn-instructor-1", 600, 750),
	},
	{
		name: "Farhana Rahman",
		title: "Lead Instructor, Beauty & Cosmetology",
		image: pic("unicorn-instructor-2", 600, 750),
	},
	{
		name: "Imran Hossain",
		title: "Instructor, Fades & Tapers",
		image: pic("unicorn-instructor-3", 600, 750),
	},
	{
		name: "Nusrat Jahan",
		title: "Instructor, Makeup & Styling",
		image: pic("unicorn-instructor-4", 600, 750),
	},
];

function Instructors() {
	return (
		<section
			className="border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="instructors-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="4"
					title="Instructors"
					id="instructors-heading"
				/>
				<div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
					{INSTRUCTORS.map((instructor) => (
						<div key={instructor.name} className="group">
							<div className="relative aspect-[4/5] overflow-hidden bg-secondary">
								<img
									src={instructor.image}
									alt={`${instructor.name}, ${instructor.title}`}
									loading="lazy"
									className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
								/>
							</div>
							<div className="mt-4 flex items-start justify-between gap-3">
								<div>
									<h3 className="text-base font-semibold text-foreground">
										{instructor.name}
									</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										{instructor.title}
									</p>
								</div>
								<a
									href="https://instagram.com"
									target="_blank"
									rel="noreferrer"
									aria-label={`${instructor.name} on Instagram`}
									className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
								>
									<IconBrandInstagram className="h-4 w-4" stroke={1.75} />
								</a>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

/* --------------------------- Testimonials --------------------------- */

const TESTIMONIALS = [
	{
		quote:
			"I walked in barely able to hold a clipper. Fourteen weeks later I had a chair waiting for me before graduation.",
		name: "Sadman Alam",
		meta: "Classic Barbering, 2025",
		image: pic("unicorn-student-1", 200, 200),
	},
	{
		quote:
			"Bridal & Editorial Makeup gave me an actual portfolio, not just a certificate. I booked my first wedding before I even graduated.",
		name: "Farzana Akter",
		meta: "Bridal & Editorial Makeup, 2025",
		image: pic("unicorn-student-2", 200, 200),
	},
	{
		quote:
			"Business of Barbering paid for itself in my first month. I priced my services wrong for years before this.",
		name: "Shakil Ahmed",
		meta: "Full Program, 2024",
		image: pic("unicorn-student-3", 200, 200),
	},
];

function Testimonials() {
	return (
		<section
			className="border-t border-primary/15 bg-secondary px-6 py-24 text-secondary-foreground lg:px-10"
			aria-labelledby="testimonials-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="5"
					title="What Graduates Say"
					id="testimonials-heading"
				/>
				<div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
					{TESTIMONIALS.map((t) => (
						<figure
							key={t.name}
							className="flex flex-col border border-primary/15 p-8"
						>
							<IconQuote
								className="h-6 w-6 text-primary/60"
								stroke={1.5}
								aria-hidden="true"
							/>
							<blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-secondary-foreground/80">
								&ldquo;{t.quote}&rdquo;
							</blockquote>
							<figcaption className="mt-6 flex items-center gap-3">
								<img
									src={t.image}
									alt=""
									loading="lazy"
									className="h-10 w-10 shrink-0 rounded-full object-cover"
								/>
								<span>
									<span className="block text-sm font-semibold">{t.name}</span>
									<span className="block text-xs text-secondary-foreground/50">
										{t.meta}
									</span>
								</span>
							</figcaption>
						</figure>
					))}
				</div>
			</div>
		</section>
	);
}

/* ------------------------------- FAQ ------------------------------- */

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

function Faq() {
	return (
		<section
			className="border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="faq-heading"
		>
			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
			/>
			<div className="mx-auto max-w-3xl">
				<SectionEyebrow guard="6" title="Frequently Asked" id="faq-heading" />
				<div className="mt-10 divide-y divide-border border-y border-border">
					{FAQS.map((item) => (
						<details key={item.q} className="group py-5">
							<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground marker:content-none">
								{item.q}
								<span
									className="shrink-0 text-primary transition-transform group-open:rotate-45"
									aria-hidden="true"
								>
									+
								</span>
							</summary>
							<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
								{item.a}
							</p>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- Visit Us ----------------------------- */

function VisitUs() {
	return (
		<section
			className="border-t border-primary/15 bg-secondary text-secondary-foreground"
			aria-labelledby="visit-heading"
		>
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<div className="flex flex-col justify-center px-6 py-24 lg:px-10">
					<SectionEyebrow
						guard="7"
						title="Visit the Academy"
						id="visit-heading"
					/>
					<address className="mt-8 space-y-5 text-sm not-italic text-secondary-foreground/75">
						<p className="flex items-start gap-3">
							<IconMapPin
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>123 Fade Street, Gulshan, Dhaka 1212, Bangladesh</span>
						</p>
						<p className="flex items-start gap-3">
							<IconPhone
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<a href="tel:+8801234567890" className="hover:text-primary">
								+880 1234-567890
							</a>
						</p>
						<p className="flex items-start gap-3">
							<IconClockHour4
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>Monday&ndash;Saturday, 9AM&ndash;7PM</span>
						</p>
					</address>
					<Link
						to="/contact"
						className={cn(
							buttonVariants({ variant: "outline" }),
							"mt-9 w-fit rounded-none border-primary bg-transparent px-6 py-5 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground",
						)}
					>
						GET DIRECTIONS
					</Link>
				</div>
				<div className="relative h-72 lg:h-auto">
					<img
						src={pic("unicorn-location-map", 1000, 900)}
						alt="Street map showing the location of Unicorn Barber Training Academy in Gulshan, Dhaka"
						className="h-full w-full object-cover opacity-70"
					/>
					<div className="absolute inset-0 bg-secondary/30" />
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- Final CTA ----------------------------- */

function FinalCta() {
	return (
		<section className="relative overflow-hidden border-t border-primary/15 bg-secondary px-6 py-28 text-center text-secondary-foreground lg:px-10">
			<svg
				viewBox="0 0 400 400"
				aria-hidden="true"
				className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-[0.03]"
			>
				<path
					d="M200 40 L240 190 L200 360 L160 190 Z"
					fill="none"
					stroke="#D4AF37"
					strokeWidth="3"
				/>
				<circle
					cx="200"
					cy="200"
					r="180"
					fill="none"
					stroke="#D4AF37"
					strokeWidth="2"
				/>
			</svg>
			<div className="relative mx-auto max-w-2xl">
				<h2
					className="text-4xl sm:text-5xl"
					style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
				>
					Your chair &mdash; or your studio &mdash;{" "}
					<span className="bg-gradient-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-transparent">
						is waiting.
					</span>
				</h2>
				<p className="mt-5 text-base leading-relaxed text-secondary-foreground/65">
					The Fall cohort starts soon and seats are limited to keep instructor
					time one-on-one. Apply now to hold your spot.
				</p>
				<div className="mt-10 flex justify-center">
					<Link
						to="/enroll"
						className={cn(
							buttonVariants(),
							"rounded-none bg-primary px-8 py-6 text-[12px] font-semibold tracking-[0.16em] text-primary-foreground hover:bg-primary/90",
						)}
					>
						ENROLL NOW
					</Link>
				</div>
			</div>
		</section>
	);
}
