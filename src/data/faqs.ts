/**
 * Homepage FAQ content. Shared by the visible accordion and the FAQPage
 * JSON-LD so answer engines always see the same questions and answers.
 */
export type FaqEntry = {
	question: string;
	answer: string;
};

export const HOME_FAQS: FaqEntry[] = [
	{
		question: 'Do I need any experience to enroll?',
		answer:
			'No. Our programs start from the fundamentals and are built for complete beginners, as well as working stylists who want to sharpen a specific skill.',
	},
	{
		question: 'What is included in the student kit?',
		answer:
			'Barbering students receive clippers and shears. Makeup and styling students receive a professional kit for their program. Everything is yours from week one.',
	},
	{
		question: 'Are the certificates recognised?',
		answer:
			'Yes. Certificates are issued under the National Technical and Vocational Qualification Framework (NTVQF) and recognised by the Bangladesh Technical Education Board (BTEB).',
	},
	{
		question: 'Do you offer payment plans?',
		answer:
			'Yes. Full tuition is due before the first day of class unless a payment plan has been agreed in writing. Our terms of service set out the full payment and refund rules.',
	},
	{
		question: 'What are the class schedules?',
		answer:
			'We run day and evening cohorts. Both follow the same curriculum with the same instructors, so you can train around a job or family.',
	},
	{
		question: 'Do you help with job placement?',
		answer:
			'Yes. More than sixty partner salons and barbershops recruit from our cohorts, and our placement team helps with introductions, portfolios and interviews.',
	},
	{
		question: 'Where is Unicorn Barber Training Academy located?',
		answer:
			'We are at House 04 (1st Floor), Block F, Main Road, Banasree, Rampura, Dhaka. Classes run Saturday to Thursday, 11:00 AM to 10:00 PM.',
	},
	{
		question: 'How long are the programs?',
		answer:
			'Program length varies from focused short courses to full career diplomas. The exact duration is listed on each program page and confirmed when you apply.',
	},
	{
		question: 'How do I enroll?',
		answer:
			'Choose a program and an open batch, complete the online admission form, and our admissions team confirms your seat after reviewing your application.',
	},
];
