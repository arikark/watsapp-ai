"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@workspace/ui/lib/utils";
import { CircleIcon } from "lucide-react";

import { Label } from "./label.js";

function RadioGroup({
  className,
  label,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        className={cn("grid gap-3", className)}
        {...props}
      />
    </div>
  );
}

function RadioGroupItem({
  className,
  label,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  label?: string;
}) {
  return (
    <div className="flex flex-row gap-2">
      <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        className={cn(
          "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="relative flex items-center justify-center"
        >
          <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {label && <Label htmlFor={props.id}>{label}</Label>}
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
