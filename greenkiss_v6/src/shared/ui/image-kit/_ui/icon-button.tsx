import * as React from 'react';
import { Button } from '@/shared/ui/kit/button';
import { cn } from '@/shared/lib/css';

export function IconButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  'aria-label': string;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn('h-8 w-8 p-0', className)}
      {...props}
    />
  );
}
