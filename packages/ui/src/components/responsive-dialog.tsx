import type * as React from 'react';
import { Button } from '../components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../components/drawer';
import { useMediaQuery } from '../hooks/use-media-query';
import { cn } from '../lib/utils';

interface ResponsiveDialogProps extends React.ComponentProps<typeof Dialog> {
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  drawerDirection?: 'top' | 'bottom' | 'left' | 'right';
}

export function ResponsiveDialog({
  title,
  description,
  trigger,
  children,
  className,
  showFooter = false,
  footerContent,
  drawerDirection = 'bottom',
  open,
  onOpenChange,
  ...props
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className={cn('sm:max-w-[825px]', className)}>
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={drawerDirection}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          {title && <DrawerTitle>{title}</DrawerTitle>}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className={cn('p-2 md:p-4', className)}>{children}</div>
        {showFooter && (
          <DrawerFooter className="pt-2">
            {footerContent || (
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            )}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
