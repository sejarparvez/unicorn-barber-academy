export const SOCIAL_URLS = {
	instagram: "https://instagram.com/unicornbarberacademy",
	facebook: "https://facebook.com/unicornbarberacademy",
	youtube: "https://youtube.com/@unicornbarberacademy",
} as const;

export type SocialPlatform = keyof typeof SOCIAL_URLS;
