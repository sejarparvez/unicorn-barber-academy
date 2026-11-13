export type ProgramCategory = 'Barbering' | 'Beauty & styling' | 'Makeup';

/** Lightweight program reference used by pickers, links and lookups. */
export type ProgramOption = {
	slug: string;
	title: string;
};

export type ProgramModule = {
	title: string;
	description: string;
};

export type BatchStatus = 'upcoming' | 'running' | 'completed' | 'cancelled';

/** A cohort of a program shown publicly, with live seat availability. */
export type ProgramBatch = {
	id: string;
	name: string;
	/** ISO date string. */
	startDate: string;
	/** ISO date string, or null when open-ended. */
	endDate: string | null;
	schedule: string;
	capacity: number;
	seatsTaken: number;
	seatsRemaining: number;
	isFull: boolean;
	status: BatchStatus;
};

/** Shape returned by the program server functions and rendered by the UI. */
export type Program = {
	id: string;
	slug: string;
	title: string;
	category: ProgramCategory;
	level: string;
	duration: string;
	tagline: string;
	description: string;
	highlights: string[];
	outcome: string;
	curriculum: ProgramModule[];
	whoFor: string[];
	careerPaths: string[];
	price: number;
	position: number;
	featured: boolean;
};
