'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/shared/ui/kit/alert-dialog';
import { cn } from '@/shared/lib/css'; 

type DialogShellProps = {
  open: boolean;
  onOpenChange?: (next: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Shell for AlertDialog with fixed sizing rules and disabled ESC/overlay close.
 */
export function DialogShell({
  open,
  onOpenChange,
  title,
  children,
  footer,
}: DialogShellProps) {
  // We intentionally do NOT allow overlay/ESC close.
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          'max-w-[1024px] w-[90vw] p-4 flex flex-col gap-4',
          'data-[state=open]:animate-none'
        )}
        // shadcn already prevents ESC/overlay close when you control open
      >
        <AlertDialogHeader className="pb-2">
          <AlertDialogTitle className="text-base font-medium">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex-1 min-h-0">{children}</div>
        {footer && <AlertDialogFooter>{footer}</AlertDialogFooter>}
      </AlertDialogContent>
    </AlertDialog>
  );
}
