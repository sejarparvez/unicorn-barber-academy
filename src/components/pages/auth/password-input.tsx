import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { type ComponentProps, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PasswordInput({
	className,
	...props
}: ComponentProps<typeof Input>) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			<Input
				{...props}
				type={visible ? 'text' : 'password'}
				className={cn('pr-10', className)}
			/>
			<button
				type="button"
				onClick={() => setVisible((current) => !current)}
				aria-label={visible ? 'Hide password' : 'Show password'}
				aria-pressed={visible}
				className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
			>
				{visible ? (
					<IconEyeOff className="h-4 w-4" stroke={1.75} />
				) : (
					<IconEye className="h-4 w-4" stroke={1.75} />
				)}
			</button>
		</div>
	);
}
