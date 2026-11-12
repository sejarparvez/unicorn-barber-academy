import { IconArrowRight, IconSchool, IconScissors } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';

// TODO: replace with the real faculty names, photos and specialities before launch.
const FACULTY = [
	{
		name: 'Arif Hossain',
		role: 'Founder & Lead Barbering Instructor',
		specialities: ['Classic cuts', 'Fades', 'Straight razor'],
		note: 'Still cuts five days a week. Believes a demo is only useful if a student can repeat it.',
	},
	{
		name: 'Tania Sultana',
		role: 'Colour & Styling Lead',
		specialities: ['Colour theory', 'Styling', 'Bridal'],
		note: 'Turns colour theory into something you can see, mix and defend in front of a client.',
	},
	{
		name: 'Moinul Islam',
		role: 'Placement & Admissions',
		specialities: ['Portfolios', 'Interviews', 'Salon network'],
		note: 'Knows which shops are hiring and what they actually look for behind the chair.',
	},
];

const INSTRUCTORS_LINK: { label: string; to: string } = {
	label: 'Meet all instructors',
	to: '/instructors',
};

function initials(name: string) {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

export default function Team() {
	return (
		<section
			aria-labelledby="team-heading"
			className="relative overflow-hidden border-b border-border/60 bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-0 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/5 blur-[130px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading
						id="team-heading"
						eyebrow="The people behind the chair"
						title={
							<>
								Taught by people who still{' '}
								<span className="text-primary">work the floor</span>.
							</>
						}
						description="Working professionals, not career lecturers. They bring the current shop floor into every class."
					/>

					<Link
						to={INSTRUCTORS_LINK.to}
						className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-[11px] text-primary uppercase tracking-[0.16em] transition-colors hover:text-primary/80"
					>
						{INSTRUCTORS_LINK.label}
						<IconArrowRight
							className="size-3.5 transition-transform group-hover:translate-x-0.5"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-14 grid gap-4 md:grid-cols-3">
					{FACULTY.map((member) => (
						<Card
							key={member.name}
							className="group relative gap-0 overflow-hidden border border-border py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5"
						>
							<span
								aria-hidden="true"
								className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
							/>

							<CardHeader className="pt-7">
								<div className="flex items-start justify-between gap-4">
									<Avatar
										size="lg"
										className="size-14 border border-primary/30"
									>
										<AvatarFallback className="bg-primary/10 font-semibold text-primary text-sm">
											{initials(member.name)}
										</AvatarFallback>
									</Avatar>
									<IconScissors
										className="size-4 text-primary/40"
										stroke={1.5}
										aria-hidden="true"
									/>
								</div>

								<div className="mt-5">
									<h3 className="font-semibold text-lg text-foreground tracking-tight transition-colors group-hover:text-primary">
										{member.name}
									</h3>
									<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
										{member.role}
									</p>
								</div>
							</CardHeader>

							<CardContent className="flex flex-1 flex-col pt-5">
								<p className="text-secondary-foreground/80 text-sm leading-relaxed">
									{member.note}
								</p>

								<ul className="mt-5 flex flex-wrap gap-1.5">
									{member.specialities.map((speciality) => (
										<li key={speciality}>
											<Badge
												variant="outline"
												className="text-[9px] text-muted-foreground uppercase tracking-[0.14em]"
											>
												{speciality}
											</Badge>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter className="mt-auto border-border/60 border-t pt-4 pb-6">
								<span className="inline-flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
									<IconSchool
										className="size-3.5 text-primary/70"
										stroke={1.75}
										aria-hidden="true"
									/>
									Faculty
								</span>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
