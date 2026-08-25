// src/components/layout/whatsapp-float.tsx
// Sitewide floating click-to-chat button. For a Dhaka academy WhatsApp is
// the primary conversion channel — keep it visible but out of the way, and
// never on print layouts (certificate pages).
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { motion } from "motion/react";
import { CONTACT } from "@/data/site";

export function WhatsappFloat() {
	return (
		<motion.a
			href={CONTACT.whatsapp}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`Chat with us on WhatsApp (${CONTACT.phoneDisplay})`}
			initial={{ opacity: 0, scale: 0.6 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: 0.8, duration: 0.3 }}
			className="fixed right-4 bottom-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 sm:right-6 sm:bottom-6"
		>
			<IconBrandWhatsapp className="h-6 w-6" stroke={1.5} />
		</motion.a>
	);
}
