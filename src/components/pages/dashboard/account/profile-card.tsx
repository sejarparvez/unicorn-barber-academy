import { zodResolver } from '@hookform/resolvers/zod';
import { IconUpload } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { getInitials } from '@/lib/utils';
import { getAvatarUploadSignature } from '@/server/cloudinary';
import { uploadAvatar } from './avatar-upload';
import { type ProfileValues, profileSchema } from './schemas';

type ProfileCardProps = {
	user: {
		name: string;
		email: string;
		image?: string | null;
	};
};

export function ProfileCard({ user }: ProfileCardProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const objectUrlRef = useRef<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState(user.image ?? null);
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<ProfileValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: { name: user.name, avatar: null },
		mode: 'onTouched',
	});

	useEffect(() => {
		return () => {
			if (objectUrlRef.current) {
				URL.revokeObjectURL(objectUrlRef.current);
			}
		};
	}, []);

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		setServerError(null);

		const file = event.target.files?.[0] ?? null;

		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
			objectUrlRef.current = null;
		}

		if (!file) {
			setValue('avatar', null, { shouldValidate: true });
			setPreviewUrl(user.image ?? null);
			return;
		}

		objectUrlRef.current = URL.createObjectURL(file);
		setPreviewUrl(objectUrlRef.current);
		setValue('avatar', file, {
			shouldDirty: true,
			shouldValidate: true,
		});
	}

	async function onSubmit(values: ProfileValues) {
		setServerError(null);

		try {
			const updates: { name: string; image?: string } = {
				name: values.name,
			};
			let nextImage = user.image ?? null;

			if (values.avatar) {
				const signature = await getAvatarUploadSignature();
				nextImage = await uploadAvatar(values.avatar, signature);
				updates.image = nextImage;
			}

			const result = await authClient.updateUser(updates);

			if (result.error) {
				setServerError(
					result.error.message ?? 'Could not update your profile.',
				);
				return;
			}

			if (objectUrlRef.current) {
				URL.revokeObjectURL(objectUrlRef.current);
				objectUrlRef.current = null;
			}

			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}

			setPreviewUrl(nextImage);
			reset({ name: values.name, avatar: null });
			await router.invalidate();
			toast.success('Profile updated.');
		} catch (error) {
			setServerError(
				error instanceof Error
					? error.message
					: 'Could not update your profile. Please try again.',
			);
		}
	}

	function onInvalid() {
		toast.error('Please fix the highlighted fields and try again.');
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>
					Update your name and profile photo. Your email address is managed by
					your sign-in provider.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					noValidate
					onSubmit={handleSubmit(onSubmit, onInvalid)}
					className="flex flex-col gap-6"
				>
					<div className="flex flex-wrap items-center gap-4">
						<Avatar className="size-20 border-2 border-primary/20">
							{previewUrl ? (
								<AvatarImage src={previewUrl} alt={user.name} />
							) : null}
							<AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>

						<div className="flex flex-col items-start gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={isSubmitting}
								onClick={() => fileInputRef.current?.click()}
							>
								<IconUpload stroke={1.75} />
								Change photo
							</Button>
							<input
								ref={fileInputRef}
								id="avatar"
								type="file"
								accept="image/jpeg,image/png,image/webp"
								className="sr-only"
								onChange={handleFileChange}
							/>
							<p className="text-xs text-muted-foreground">
								JPEG, PNG, or WebP. Max 1 MB.
							</p>
						</div>
					</div>

					{errors.avatar ? <FieldError errors={[errors.avatar]} /> : null}

					<FieldGroup className="gap-5">
						<Field data-invalid={!!errors.name}>
							<FieldLabel htmlFor="name">Full name</FieldLabel>
							<Input
								id="name"
								type="text"
								autoComplete="name"
								aria-invalid={!!errors.name}
								aria-describedby={errors.name ? 'name-error' : undefined}
								{...register('name')}
							/>
							<FieldError id="name-error" errors={[errors.name]} />
						</Field>

						<Field data-disabled>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								value={user.email}
								readOnly
								disabled
							/>
							<FieldDescription>
								Email changes aren&apos;t available yet.
							</FieldDescription>
						</Field>
					</FieldGroup>

					{serverError ? <AuthAlert message={serverError} /> : null}

					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Saving…' : 'Save profile'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
