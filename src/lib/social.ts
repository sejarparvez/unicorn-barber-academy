// src/lib/social.ts
// Official academy social profiles — single source of truth for visible
// links (footer) and JSON-LD sameAs arrays. Keep in sync with the real
// accounts; order does not matter.
export const SOCIAL_URLS = {
	instagram: "https://www.instagram.com/unicornbarbertrainingacademy",
	facebook: "https://www.facebook.com/unicornbarberacademy",
	youtube: "https://www.youtube.com/@UnicornBarberTrainingAcademy",
	tiktok: "https://www.tiktok.com/@unicorntrainingacademy",
	x: "https://x.com/unicorntraining",
} as const;

export type SocialPlatform = keyof typeof SOCIAL_URLS;
