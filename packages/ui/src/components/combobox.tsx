'use client';

import { debounce } from 'lodash-es';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface ComboboxProps extends React.ComponentProps<typeof Popover> {
  placeholder: string;
  options: { value: string; label: string | React.ReactNode }[];
  onSearch: (value: string) => void;
  debounceTime?: number;
  isLoading?: boolean;
  triggerProps?: React.ComponentProps<typeof Button>;
  onSelect?: (value: string) => void;
  label?: string;
  emptyMessage?: React.ReactNode;
}

export function Combobox({
  options,
  placeholder,
  onSearch,
  isLoading,
  debounceTime = 300,
  onSelect,
  triggerProps,
  label,
  emptyMessage = 'No results found.',
  ...props
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  // Create debounced search function outside of useCallback
  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => onSearch(value), debounceTime),
    [onSearch, debounceTime]
  );

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? '' : currentValue;
    setValue(newValue);
    setOpen(false);
    onSelect?.(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-2 w-full">
          {label && <Label>{label}</Label>}
          <Button
            {...triggerProps}
            type="button"
            variant="outline"
            aria-expanded={open}
            className={cn(
              'w-full min-w-[200px] justify-between overflow-hidden',
              triggerProps?.className
            )}
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput
            onValueChange={debounceTime ? debouncedSearch : onSearch}
            placeholder={placeholder}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty className="flex justify-center items-center py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </CommandEmpty>
            ) : (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
