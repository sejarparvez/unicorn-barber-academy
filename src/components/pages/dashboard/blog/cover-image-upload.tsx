import {
	IconLoader2,
	IconPhoto,
	IconTrash,
	IconUpload,
} from '@tabler/icons-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from './use-image-upload';

export function CoverImageUpload({
	value,
	onChange,
	disabled,
}: {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { upload, uploading, error } = useImageUpload();

	async function onFile(file: File) {
		const url = await upload(file);
		if (url) {
			onChange(url);
		}
	}

	return (
		<div className="flex flex-col gap-3">
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/avif"
				className="sr-only"
				tabIndex={-1}
				onChange={(event) => {
					const file = event.target.files?.[0];
					event.target.value = '';
					if (file) {
						void onFile(file);
					}
				}}
			/>

			{value ? (
				<div className="relative overflow-hidden rounded-xl border border-border">
					<img src={value} alt="" className="aspect-16/9 w-full object-cover" />
				</div>
			) : (
				<div className="flex aspect-16/9 w-full items-center justify-center rounded-xl border border-border border-dashed bg-muted/30 text-muted-foreground">
					<IconPhoto className="size-8" stroke={1.5} />
				</div>
			)}

			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled || uploading}
					onClick={() => inputRef.current?.click()}
				>
					{uploading ? (
						<IconLoader2 className="animate-spin" stroke={1.75} />
					) : (
						<IconUpload stroke={1.75} />
					)}
					{value ? 'Replace image' : 'Upload image'}
				</Button>

				{value ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						disabled={disabled || uploading}
						onClick={() => onChange('')}
					>
						<IconTrash stroke={1.75} />
						Remove
					</Button>
				) : null}
			</div>

			{error ? (
				<p role="alert" className="text-destructive text-xs">
					{error}
				</p>
			) : null}
		</div>
	);
}
