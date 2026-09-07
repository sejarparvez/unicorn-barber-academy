// src/features/dashboard/settings/profile-card.tsx
// Profile section: avatar upload (Cloudinary-backed), display name, email
// verification, and resend-verification action.
import { IconDeviceLaptop } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";

export function ProfileCard({
	name,
	email,
	image,
	emailVerified,
	onChanged,
}: {
	name: string;
	email: string;
	image: string | null;
	emailVerified: boolean;
	onChanged: () => Promise<void> | void;
}) {
	const [displayName, setDisplayName] = useState(name);
	const [savingName, setSavingName] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileInput = useRef<HTMLInputElement>(null);

	async function saveName(event: React.FormEvent) {
		event.preventDefault();
		const next = displayName.trim();
		if (!next || next === name) return;
		setSavingName(true);
		try {
			const { error } = await authClient.updateUser({ name: next });
			if (error) throw new Error(error.message ?? "Could not save");
			toast.success("Profile updated");
			await onChanged();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save");
		} finally {
			setSavingName(false);
		}
	}

	const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
	const MAX_SIZE_BYTES = 2 * 1024 * 1024;

	async function uploadAvatar(file: File) {
		if (!ACCEPTED_TYPES.includes(file.type)) {
			toast.error("Please upload a JPEG, PNG, or WebP image.");
			if (fileInput.current) fileInput.current.value = "";
			return;
		}
		if (file.size > MAX_SIZE_BYTES) {
			toast.error("Image must be under 2 MB.");
			if (fileInput.current) fileInput.current.value = "";
			return;
		}
		setUploading(true);
		try {
			const form = new FormData();
			form.set("file", file);
			const res = await fetch("/api/upload/avatar", {
				method: "POST",
				body: form,
			});
			const body = (await res.json().catch(() => ({}))) as {
				message?: string;
			};
			if (!res.ok) {
				throw new Error(body.message ?? "Upload failed");
			}
			toast.success("Avatar updated");
			await onChanged();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
			if (fileInput.current) fileInput.current.value = "";
		}
	}

	async function resendVerification() {
		try {
			const { error } = await authClient.sendVerificationEmail({
				email,
				callbackURL: "/dashboard/settings",
			});
			if (error) throw new Error(error.message ?? "Could not send");
			toast.success("Verification email sent — check your inbox");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not send");
		}
	}

	return (
		<section className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 className="font-heading text-lg font-semibold">Profile</h2>

			<div className="mt-5 flex flex-wrap items-center gap-5">
				<div className="relative">
					<Avatar className="h-16 w-16 border-2 border-primary/20">
						<AvatarImage src={image ?? undefined} alt={name || "User avatar"} />
						<AvatarFallback className="bg-primary/10 text-lg font-semibold">
							{getInitials(name)}
						</AvatarFallback>
					</Avatar>
					<button
						type="button"
						disabled={uploading}
						onClick={() => fileInput.current?.click()}
						className="absolute -right-1 -bottom-1 cursor-pointer rounded-full bg-primary p-1.5 text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
						aria-label="Change avatar"
					>
						<IconDeviceLaptop className="h-3 w-3" stroke={2} />
					</button>
					<input
						ref={fileInput}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						className="hidden"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) void uploadAvatar(file);
						}}
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					JPEG, PNG or WebP · max 2 MB
				</p>
			</div>

			<form onSubmit={saveName} className="mt-6 grid gap-4 sm:max-w-md">
				<div className="space-y-1.5">
					<Label htmlFor="settings-name">Display name</Label>
					<div className="flex gap-2">
						<Input
							id="settings-name"
							value={displayName}
							maxLength={80}
							onChange={(event) => setDisplayName(event.target.value)}
						/>
						<Button
							type="submit"
							variant="outline"
							disabled={
								savingName ||
								displayName.trim() === name ||
								displayName.trim() === ""
							}
						>
							{savingName ? "Saving…" : "Save"}
						</Button>
					</div>
				</div>

				<div className="space-y-1.5">
					<Label>Email</Label>
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm font-medium break-all">{email}</span>
						{emailVerified ? (
							<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
								Verified
							</Badge>
						) : (
							<>
								<Badge
									variant="outline"
									className="h-5 px-1.5 text-[10px] text-amber-600"
								>
									Unverified
								</Badge>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => void resendVerification()}
								>
									Resend verification
								</Button>
							</>
						)}
					</div>
				</div>
			</form>
		</section>
	);
}
