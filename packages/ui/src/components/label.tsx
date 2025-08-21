'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import type * as React from 'react';
import { cn } from '../lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

function LabelWithTooltip({
  tooltipProps,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  tooltipProps: React.ComponentProps<typeof Tooltip> & {
    icon: React.ReactNode;
    content: string;
  };
}) {
  return (
    <Tooltip {...tooltipProps}>
      <div className="relative inline-flex items-center max-w-fit">
        <Label {...props} />
        <TooltipTrigger asChild className="absolute -top-2 -right-3">
          {tooltipProps.icon}
        </TooltipTrigger>
      </div>
      <TooltipContent className="max-w-78 text-center">
        {tooltipProps.content}
      </TooltipContent>
    </Tooltip>
  );
}

export { Label, LabelWithTooltip };
