import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconWand } from '@tabler/icons-react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import {
	POST_CATEGORY_OPTIONS,
	POST_STATUS_OPTIONS,
	slugify,
} from '@/components/pages/blog/types';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createPost, updatePost } from '@/server/admin/posts';
import { CoverImageUpload } from './cover-image-upload';
import { MarkdownEditor } from './markdown-editor';
import { type PostFormValues, postSchema } from './schemas';

export function createEmptyPost(authorName: string): PostFormValues {
	return {
		title: '',
		slug: '',
		excerpt: '',
		body: '',
		category: 'barbering',
		tags: [],
		coverImage: '',
		coverImageAlt: '',
		status: 'draft',
		featured: false,
		authorName,
	};
}

export function PostForm({
	mode,
	postId,
	defaultValues,
}: {
	mode: 'create' | 'edit';
	postId?: string;
	defaultValues: PostFormValues;
}) {
	const router = useRouter();
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		control,
		handleSubmit,
		setValue,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm<PostFormValues>({
		resolver: zodResolver(postSchema),
		defaultValues,
		mode: 'onTouched',
	});

	function generateSlug() {
		const slug = slugify(getValues('title'));
		if (!slug) {
			toast.error('Add a title first.');
			return;
		}
		setValue('slug', slug, { shouldValidate: true, shouldDirty: true });
	}

	async function onSubmit(values: PostFormValues) {
		setServerError(null);

		try {
			if (mode === 'edit' && postId) {
				await updatePost({ data: { id: postId, ...values } });
				toast.success('Post updated.');
			} else {
				await createPost({ data: values });
				toast.success('Post created.');
			}

			await router.invalidate();
			await navigate({ to: '/dashboard/blog' });
		} catch (error) {
			setServerError(
				error instanceof Error
					? error.message
					: 'Could not save the post. Please try again.',
			);
		}
	}

	return (
		<form
			noValidate
			onSubmit={handleSubmit(onSubmit, () =>
				toast.error('Please fix the highlighted fields and try again.'),
			)}
			className="flex flex-col gap-6"
		>
			<Card>
				<CardHeader>
					<CardTitle>Article</CardTitle>
					<CardDescription>
						The title, URL and body of the post.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-6">
						<Field data-invalid={!!errors.title}>
							<FieldLabel htmlFor="title">Title</FieldLabel>
							<Input
								id="title"
								placeholder="How to hold a straight razor"
								aria-invalid={!!errors.title}
								{...register('title')}
							/>
							<FieldError errors={[errors.title]} />
						</Field>

						<Field data-invalid={!!errors.slug}>
							<FieldLabel htmlFor="slug">Slug</FieldLabel>
							<div className="flex items-center gap-2">
								<Input
									id="slug"
									placeholder="how-to-hold-a-straight-razor"
									aria-invalid={!!errors.slug}
									{...register('slug')}
								/>
								<Button
									type="button"
									variant="outline"
									size="icon"
									title="Generate from title"
									aria-label="Generate slug from title"
									onClick={generateSlug}
								>
									<IconWand stroke={1.75} />
								</Button>
							</div>
							<FieldDescription>
								Used in the URL: /blog/your-slug
							</FieldDescription>
							<FieldError errors={[errors.slug]} />
						</Field>

						<Field data-invalid={!!errors.body}>
							<FieldLabel htmlFor="body">Body</FieldLabel>
							<Controller
								control={control}
								name="body"
								render={({ field }) => (
									<MarkdownEditor
										id="body"
										value={field.value}
										onChange={field.onChange}
									/>
								)}
							/>
							<FieldError errors={[errors.body]} />
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Details</CardTitle>
					<CardDescription>
						How the post is categorised and credited.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-6">
						<div className="grid gap-6 sm:grid-cols-2">
							<Controller
								control={control}
								name="category"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="category">Category</FieldLabel>
										<Select
											items={POST_CATEGORY_OPTIONS}
											name={field.name}
											value={field.value}
											onValueChange={(value) => {
												if (value) {
													field.onChange(value);
												}
											}}
										>
											<SelectTrigger
												id="category"
												className="w-full"
												aria-invalid={fieldState.invalid}
												onBlur={field.onBlur}
											>
												<SelectValue placeholder="Choose a category" />
											</SelectTrigger>
											<SelectContent>
												{POST_CATEGORY_OPTIONS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>

							<Field data-invalid={!!errors.authorName}>
								<FieldLabel htmlFor="authorName">Author</FieldLabel>
								<Input
									id="authorName"
									placeholder="Unicorn Academy"
									aria-invalid={!!errors.authorName}
									{...register('authorName')}
								/>
								<FieldError errors={[errors.authorName]} />
							</Field>
						</div>

						<Field data-invalid={!!errors.excerpt}>
							<FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
							<Textarea
								id="excerpt"
								rows={3}
								className="min-h-20 resize-y"
								placeholder="A one or two sentence summary shown on the blog index."
								aria-invalid={!!errors.excerpt}
								{...register('excerpt')}
							/>
							<FieldDescription>
								Leave blank to generate one from the body.
							</FieldDescription>
							<FieldError errors={[errors.excerpt]} />
						</Field>

						<Controller
							control={control}
							name="tags"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="tags">Tags</FieldLabel>
									<Textarea
										id="tags"
										rows={3}
										className="min-h-20 resize-y"
										placeholder={'technique\nfades\ntools'}
										aria-invalid={fieldState.invalid}
										value={
											Array.isArray(field.value) ? field.value.join('\n') : ''
										}
										onChange={(event) =>
											field.onChange(event.target.value.split('\n'))
										}
										onBlur={field.onBlur}
									/>
									<FieldDescription>
										One tag per line. Up to six.
									</FieldDescription>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Cover image</CardTitle>
					<CardDescription>
						Shown on the blog index and at the top of the article.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-6">
						<Controller
							control={control}
							name="coverImage"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<CoverImageUpload
										value={field.value}
										onChange={field.onChange}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Field data-invalid={!!errors.coverImageAlt}>
							<FieldLabel htmlFor="coverImageAlt">Cover alt text</FieldLabel>
							<Input
								id="coverImageAlt"
								placeholder="A barber shaping a fade with clippers"
								aria-invalid={!!errors.coverImageAlt}
								{...register('coverImageAlt')}
							/>
							<FieldDescription>
								Describe the image for screen readers and search engines.
							</FieldDescription>
							<FieldError errors={[errors.coverImageAlt]} />
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Publishing</CardTitle>
					<CardDescription>
						Drafts are only visible here. Published posts appear on the public
						blog.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-6">
						<Controller
							control={control}
							name="status"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="status">Status</FieldLabel>
									<Select
										items={POST_STATUS_OPTIONS}
										name={field.name}
										value={field.value}
										onValueChange={(value) => {
											if (value) {
												field.onChange(value);
											}
										}}
									>
										<SelectTrigger
											id="status"
											className="w-full sm:w-56"
											aria-invalid={fieldState.invalid}
											onBlur={field.onBlur}
										>
											<SelectValue placeholder="Choose a status" />
										</SelectTrigger>
										<SelectContent>
											{POST_STATUS_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Field orientation="horizontal">
							<input
								id="featured"
								type="checkbox"
								className="size-4 shrink-0 rounded border-input accent-primary"
								{...register('featured')}
							/>
							<div className="flex flex-col gap-1">
								<FieldLabel htmlFor="featured">Featured</FieldLabel>
								<FieldDescription>
									Highlight this post at the top of the blog.
								</FieldDescription>
							</div>
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>

			{serverError ? <AuthAlert message={serverError} /> : null}

			<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					render={<Link to="/dashboard/blog" />}
				>
					<IconArrowLeft stroke={1.75} />
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? 'Saving…'
						: mode === 'edit'
							? 'Save changes'
							: 'Create post'}
				</Button>
			</div>
		</form>
	);
}
