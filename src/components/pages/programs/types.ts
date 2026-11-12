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

/** Shape returned by the program server functions and rendered by the UI. */
export type Program = {
	id: string;
	slug: string;
	title: string;
	category: ProgramCategory;
	level: string;
	duration: string;
	schedule: string;
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
