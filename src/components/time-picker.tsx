import React from "react";
import { format } from "date-fns";

import { cn } from "src/utils";

export interface TimePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  defaultTime?: Date;
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, defaultTime, ...props }, ref) => {
    const defaultValue = defaultTime
      ? new Date(defaultTime)
      : new Date(Date.now());
    console.log(defaultValue);
    return (
      <input
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
        type="time"
        value={format(defaultValue, "HH:mm")}
      />
    );
  }
);
TimePicker.displayName = "TimePicker";
