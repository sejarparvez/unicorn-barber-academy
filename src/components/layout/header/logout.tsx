import { IconLogout } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export function SignOut() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSignOut = async () => {
		setIsSigningOut(true);
		setError(null);
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						setOpen(false);
						router.navigate({ to: "/" });
						// Re-run loaders so session-dependent UI (header, /dashboard
						// guard) reflects the now-signed-out state.
						router.invalidate();
					},
					onError: (ctx) => {
						setIsSigningOut(false);
						setError(
							ctx.error.message ??
								"Could not sign out. Please try again in a moment.",
						);
					},
				},
			});
		} catch (_error) {
			setIsSigningOut(false);
			setError("Network error while signing out. Please try again.");
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				render={
					<DropdownMenuItem
						className="flex w-full cursor-pointer items-center gap-3 py-2.5 text-destructive focus:text-destructive"
						onSelect={(e) => {
							e.preventDefault();
							setOpen(true);
						}}
					/>
				}
			>
				<IconLogout className="h-4 w-4" stroke={1.75} />
				<span className="font-medium">Sign Out</span>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
					<AlertDialogDescription>
						You will be redirected to the home page and will need to sign in
						again to access your account.
					</AlertDialogDescription>
					{error ? (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					) : null}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isSigningOut}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleSignOut}
						disabled={isSigningOut}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isSigningOut ? "Signing out..." : "Sign Out"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
