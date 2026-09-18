// src/features/admin/console-charts.tsx
// Read-only chart cards for the admin console. Each receives the already
// loaded slice of ConsoleOverview and renders a recharts visualization via the
// shadcn chart primitives (src/components/ui/chart.tsx).
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type {
	AdmissionsStats,
	FeeRevenuePoint,
	ProgramApplications,
	TimelinePoint,
} from "@/lib/console";
import {
	APPLICATION_STATUS_LABELS,
	type ApplicationStatus,
	formatFeePoisha,
} from "@/lib/enrollment";

/* ------------------------------- helpers -------------------------------- */

/** "2026-03" → "Mar ’26". Month buckets are UTC from SQL to_char. */
function formatMonthAbr(month: string): string {
	const d = new Date(`${month}-01T00:00:00Z`);
	const m = d.toLocaleString("en-US", { month: "short" });
	return `${m} ’${String(d.getUTCFullYear()).slice(2)}`;
}

/** 45000 → "45k", 1200000 → "1.2M". Compact BDT axis ticks. */
function compactTaka(value: number): string {
	const v = Number(value);
	if (v >= 1_000_000) {
		return `${(v / 1_000_000).toLocaleString("en-US", {
			maximumFractionDigits: 1,
		})}M`;
	}
	if (v >= 1_000) {
		return `${(v / 1_000).toLocaleString("en-US", {
			maximumFractionDigits: 0,
		})}k`;
	}
	return v.toLocaleString("en-US");
}

/** Pipeline status → chart palette slot (gold ramp + primary for done). */
const PIPELINE_COLORS: Record<ApplicationStatus, string> = {
	pending: "var(--chart-3)",
	reviewing: "var(--chart-4)",
	approved: "var(--chart-1)",
	waitlisted: "var(--chart-2)",
	rejected: "var(--chart-5)",
	completed: "var(--primary)",
};

const RAMP = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

/* ------------------------------ card wrapper ----------------------------- */

function ConsoleChartCard({
	title,
	description,
	action,
	children,
}: {
	title: string;
	description?: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
				{action ? <CardAction>{action}</CardAction> : null}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

function ChartEmpty({ children }: { children: React.ReactNode }) {
	return (
		<div className="grid h-60 place-items-center rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
			{children}
		</div>
	);
}

/* --------------------------- applications timeline ------------------------ */

const timelineConfig = {
	applications: { label: "Applications", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ApplicationsTimelineChart({ data }: { data: TimelinePoint[] }) {
	return (
		<ConsoleChartCard
			title="Application submissions"
			description="New applications per month, last 12 months"
		>
			<ChartContainer
				config={timelineConfig}
				className="aspect-auto h-60 w-full"
			>
				<AreaChart data={data} margin={{ left: 4, right: 8 }}>
					<defs>
						<linearGradient
							id="console-timeline-fill"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="var(--color-applications)"
								stopOpacity={0.35}
							/>
							<stop
								offset="95%"
								stopColor="var(--color-applications)"
								stopOpacity={0}
							/>
						</linearGradient>
					</defs>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="month"
						tickLine={false}
						axisLine={false}
						tickMargin={10}
						tickFormatter={formatMonthAbr}
						minTickGap={20}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						allowDecimals={false}
						width={36}
					/>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								labelFormatter={(v) => formatMonthAbr(String(v))}
							/>
						}
					/>
					<Area
						dataKey="count"
						type="natural"
						fill="url(#console-timeline-fill)"
						stroke="var(--color-applications)"
						strokeWidth={2}
					/>
				</AreaChart>
			</ChartContainer>
		</ConsoleChartCard>
	);
}

/* -------------------------------- pipeline -------------------------------- */

const pipelineConfig = {
	pending: { label: APPLICATION_STATUS_LABELS.pending },
	reviewing: { label: APPLICATION_STATUS_LABELS.reviewing },
	approved: { label: APPLICATION_STATUS_LABELS.approved },
	waitlisted: { label: APPLICATION_STATUS_LABELS.waitlisted },
	rejected: { label: APPLICATION_STATUS_LABELS.rejected },
	completed: { label: APPLICATION_STATUS_LABELS.completed },
} satisfies ChartConfig;

export function PipelineChart({ admissions }: { admissions: AdmissionsStats }) {
	const data = Object.entries(admissions.byStatus).map(([status, count]) => ({
		status,
		count,
		fill: PIPELINE_COLORS[status as ApplicationStatus],
	}));

	return (
		<ConsoleChartCard
			title="Pipeline"
			description={`${admissions.total} applications across the six statuses`}
		>
			{admissions.total === 0 ? (
				<ChartEmpty>
					No applications yet — the pipeline fills in once enrollment opens.
				</ChartEmpty>
			) : (
				<ChartContainer
					config={pipelineConfig}
					className="aspect-auto h-60 w-full"
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Pie
							data={data}
							dataKey="count"
							nameKey="status"
							innerRadius={48}
							outerRadius={72}
							paddingAngle={3}
							strokeWidth={5}
						>
							{data.map((entry) => (
								<Cell key={entry.status} fill={entry.fill} />
							))}
						</Pie>
						<ChartLegend
							content={<ChartLegendContent nameKey="status" />}
							className="flex-wrap gap-x-4 gap-y-1"
						/>
					</PieChart>
				</ChartContainer>
			)}
		</ConsoleChartCard>
	);
}

/* ------------------------- applications by program ------------------------ */

const programsConfig = {
	applications: { label: "Applications" },
} satisfies ChartConfig;

export function ProgramsChart({ data }: { data: ProgramApplications[] }) {
	return (
		<ConsoleChartCard
			title="Applications by program"
			description="Most-popular programs, top 8"
		>
			{data.length === 0 ? (
				<ChartEmpty>
					No applications yet — program splits appear here.
				</ChartEmpty>
			) : (
				<ChartContainer
					config={programsConfig}
					className="aspect-auto h-60 w-full"
				>
					<BarChart
						data={data}
						layout="vertical"
						margin={{ left: 0, right: 8 }}
					>
						<CartesianGrid horizontal={false} />
						<XAxis
							type="number"
							tickLine={false}
							axisLine={false}
							allowDecimals={false}
							tickMargin={8}
						/>
						<YAxis
							type="category"
							dataKey="programTitle"
							tickLine={false}
							axisLine={false}
							width={150}
							tickMargin={8}
							tickFormatter={(title) =>
								title.length > 18 ? `${title.slice(0, 18)}…` : title
							}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									hideLabel
									labelFormatter={(v) => String(v)}
								/>
							}
						/>
						<Bar
							dataKey="count"
							radius={[0, 4, 4, 0]}
							barSize={14}
							fill="var(--chart-2)"
						>
							{data.map((entry, index) => (
								<Cell
									key={entry.programTitle}
									fill={RAMP[index % RAMP.length]}
								/>
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			)}
		</ConsoleChartCard>
	);
}

/* ------------------------------ fee revenue ------------------------------- */

const feesConfig = {
	fees: { label: "Collected", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function FeesChart({ data }: { data: FeeRevenuePoint[] }) {
	const bdt = data.map((p) => ({
		month: p.month,
		amount: Math.round(p.amountPoisha / 100),
	}));

	return (
		<ConsoleChartCard
			title="Collected fees"
			description="Fee revenue received per month, last 12 months"
		>
			<ChartContainer config={feesConfig} className="aspect-auto h-60 w-full">
				<BarChart data={bdt} margin={{ left: 4, right: 8 }}>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="month"
						tickLine={false}
						axisLine={false}
						tickMargin={10}
						tickFormatter={formatMonthAbr}
						minTickGap={20}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						allowDecimals={false}
						width={44}
						tickFormatter={(v) => compactTaka(Number(v))}
					/>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								labelFormatter={(v) => formatMonthAbr(String(v))}
								formatter={(value) => (
									<>
										<span className="text-muted-foreground">Collected</span>
										<span className="font-mono font-medium tabular-nums">
											{formatFeePoisha(Math.round(Number(value)) * 100)}
										</span>
									</>
								)}
							/>
						}
					/>
					<Bar
						dataKey="amount"
						radius={[4, 4, 0, 0]}
						barSize={16}
						fill="var(--color-fees)"
					/>
				</BarChart>
			</ChartContainer>
		</ConsoleChartCard>
	);
}
