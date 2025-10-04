"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch@1.1.3";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base styles - simple and clean with rounded corners - FLAT design
        "peer inline-flex shrink-0 items-center rounded-full transition-colors duration-200 outline-none",
        // Size - flat and wide (lower height, same width)
        "h-4 w-10",
        // Unchecked state - simple gray
        "bg-gray-300",
        // Checked state - simple blue
        "data-[state=checked]:bg-blue-500",
        // Focus states
        "focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
        // Dark mode
        "dark:bg-gray-600 dark:data-[state=checked]:bg-blue-600",
        "dark:focus-visible:ring-offset-gray-900",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Base thumb styles - minimal with rounded corners - smaller for flat design
          "pointer-events-none block rounded-full transition-transform duration-200",
          // Size - smaller thumb for flat switch (2.5rem with small margin)
          "h-2.5 w-2.5 m-0.75",
          // Colors - pure white
          "bg-white",
          // Transform animations - adjusted for smaller thumb
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
          // Dark mode
          "dark:bg-white",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
