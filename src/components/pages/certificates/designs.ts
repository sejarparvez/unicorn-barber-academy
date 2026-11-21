export type CertificateDesignId =
	| 'black-gold'
	| 'ivory-gold'
	| 'navy-gold'
	| 'emerald-gold'
	| 'burgundy-cream'
	| 'white-gold'
	| 'formal-diploma'
	| 'laurel-award';

export type CertificateSampleData = {
	studentName: string;
	programTitle: string;
	batchName: string;
	duration: string;
	certificateNo: string;
	issuedAt: string;
	verifyUrl: string;
};

export const SAMPLE_CERTIFICATE: CertificateSampleData = {
	studentName: 'MD. RAHIM UDDIN',
	programTitle: 'Barber Foundation Training Program',
	batchName: 'Morning Batch',
	duration: '22 classes',
	certificateNo: 'UBA-2026-0012',
	issuedAt: '21 November 2026',
	verifyUrl: 'https://unicornbarberacademy.com/verify?no=UBA-2026-0012',
};

export type CertificateDesignMeta = {
	id: CertificateDesignId;
	name: string;
};

export const CERTIFICATE_DESIGNS: CertificateDesignMeta[] = [
	{ id: 'black-gold', name: 'Black & Gold' },
	{ id: 'ivory-gold', name: 'Ivory & Gold' },
	{ id: 'navy-gold', name: 'Navy & Gold' },
	{ id: 'emerald-gold', name: 'Emerald & Gold' },
	{ id: 'burgundy-cream', name: 'Burgundy & Cream' },
	{ id: 'white-gold', name: 'White & Gold' },
	{ id: 'formal-diploma', name: 'Formal Diploma' },
	{ id: 'laurel-award', name: 'Laurel Award' },
];
