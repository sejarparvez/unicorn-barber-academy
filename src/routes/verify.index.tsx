// src/routes/verify.tsx
// Public certificate verification landing page. The footer links here;
// /verify/$code holds the full result view.
import { IconSearch } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useSite } from "@/lib/site-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verify/")({
	head: () => ({
		meta: [
			{
				title: "Verify a Certificate | Unicorn Barber Training Academy",
			},
			{
				name: "description",
				content:
					"Confirm the authenticity of a Unicorn Barber Training Academy certificate by its verification code.",
			},
			{ property: "og:type", content: "website" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: VerifyLandingPage,
});

function VerifyLandingPage() {
	const { contact } = useSite();
	const navigate = useNavigate();
	const [value, setValue] = useState("");

	return (
		<main className="mx-auto max-w-2xl px-6 py-24">
			<header className="text-center">
				<Badge
					variant="outline"
					className="font-mono text-[10px] tracking-[0.32em] uppercase"
				>
					Certificate verification
				</Badge>
				<h1 className="mt-4 font-heading text-4xl font-medium tracking-tight sm:text-5xl">
					Check a graduate&rsquo;s credential
				</h1>
				<p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
					Every certificate we issue carries a unique code. Enter it below or
					scan the QR code on the document to confirm authenticity.
				</p>
			</header>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					const normalized = value.trim().toUpperCase();
					if (!normalized) return;
					void navigate({
						to: "/verify/$code",
						params: { code: encodeURIComponent(normalized) },
					});
				}}
				className="mx-auto mt-10 flex max-w-md items-center gap-2"
			>
				<label htmlFor="verify-code-landing" className="sr-only">
					Certificate code
				</label>
				<input
					id="verify-code-landing"
					value={value}
					onChange={(event) => setValue(event.target.value)}
					placeholder="UBT-2025-0001"
					autoCapitalize="characters"
					className="h-11 w-full rounded-md border border-border bg-background px-3 font-mono text-sm uppercase placeholder:text-muted-foreground/60"
				/>
				<button
					type="submit"
					className={cn(
						buttonVariants(),
						"inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5",
					)}
				>
					<IconSearch className="h-4 w-4" stroke={1.75} />
					Verify
				</button>
			</form>

			<p className="mt-6 text-center text-xs text-muted-foreground">
				Need help? Contact the academy at {contact.phoneDisplay}.
			</p>
		</main>
	);
}
