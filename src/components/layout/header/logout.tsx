import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { authClient } from '@/lib/auth-client';

export function SignOut({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// This component stays mounted across open/close, so a failed attempt's
	// message would otherwise still be showing the next time the dialog opens.
	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setError(null);
		}
		onOpenChange(nextOpen);
	};

	const handleSignOut = async () => {
		setIsSigningOut(true);
		setError(null);
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						onOpenChange(false);
						router.navigate({ to: '/' });
						// Re-run loaders so session-dependent UI (header, /dashboard
						// guard) reflects the now-signed-out state.
						router.invalidate();
					},
					onError: (ctx) => {
						setIsSigningOut(false);
						setError(
							ctx.error.message ??
								'Could not sign out. Please try again in a moment.',
						);
					},
				},
			});
		} catch (_error) {
			setIsSigningOut(false);
			setError('Network error while signing out. Please try again.');
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
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
						{isSigningOut ? 'Signing out...' : 'Sign Out'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
